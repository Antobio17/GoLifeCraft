<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionProposalResult;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProposalCoveredItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProposalPackCandidate;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProposalPackHint;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProposalToCookItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionProposalNeedleDataQuery;

final readonly class DoctrineGetProductionProposalNeedleDataQuery implements GetProductionProposalNeedleDataQuery
{
    private const float MAX_PACK_UPLIFT = 2.0;

    public function __construct(
        private Connection $connection,
        private DoctrineProductionIngredientResolver $ingredientResolver,
    ) {
    }

    public function findProposal(string $fromDate, string $toDate): GetProductionProposalResult
    {
        $demand = $this->demandByRecipe(fromDate: $fromDate, toDate: $toDate);
        $order = $this->cookingOrder(recipeIds: array_keys($demand));
        $recipes = $this->recipesById(recipeIds: $order);
        $stock = $this->stockByRecipe(recipeIds: $order);
        $inProduction = $this->plannedByRecipe(recipeIds: $order);

        $requiredBy = [];

        foreach (array_reverse(array: $order) as $recipeId) {
            $deficit = $this->deficitOf(
                demand: $demand[$recipeId] ?? 0.0,
                recipeId: $recipeId,
                stock: $stock,
                inProduction: $inProduction,
            );

            if ($deficit <= 0.0) {
                continue;
            }

            foreach ($this->ingredientResolver->resolveDirect(recipeId: $recipeId, servings: $deficit)->subRecipes as $subRecipe) {
                $demand[$subRecipe->recipeId] = round(
                    num: ($demand[$subRecipe->recipeId] ?? 0.0) + $subRecipe->servings,
                    precision: ProductionItem::SERVINGS_PRECISION,
                );
                $requiredBy[$subRecipe->recipeId][] = $recipes[$recipeId]['name'] ?? '';
            }
        }

        $toCook = [];
        $covered = [];
        $packs = null;

        foreach ($order as $recipeId) {
            $recipe = $recipes[$recipeId] ?? null;
            if (null === $recipe) {
                continue;
            }

            $servings = $demand[$recipeId] ?? 0.0;

            if ($servings <= 0.0) {
                continue;
            }

            $deficit = $this->deficitOf(
                demand: $servings,
                recipeId: $recipeId,
                stock: $stock,
                inProduction: $inProduction,
            );

            if ($deficit <= 0.0) {
                $covered[] = new ProposalCoveredItem(
                    recipeId: $recipeId,
                    name: $recipe['name'],
                    emoji: $recipe['emoji'],
                    image: $recipe['image'],
                    demand: $servings,
                    inStock: $stock[$recipeId] ?? 0.0,
                    inProduction: $inProduction[$recipeId] ?? 0.0,
                );

                continue;
            }

            $toCook[] = new ProposalToCookItem(
                recipeId: $recipeId,
                name: $recipe['name'],
                emoji: $recipe['emoji'],
                image: $recipe['image'],
                demand: $servings,
                inStock: $stock[$recipeId] ?? 0.0,
                inProduction: $inProduction[$recipeId] ?? 0.0,
                deficit: $deficit,
                requiredBy: array_values(array: array_unique(array: $requiredBy[$recipeId] ?? [])),
                packHint: $this->packHint(
                    recipeId: $recipeId,
                    deficit: $deficit,
                    packs: $packs ??= $this->packsByArticle(),
                ),
            );
        }

        return new GetProductionProposalResult(
            id: sprintf('%s_%s', $fromDate, $toDate),
            aggregateName: 'ProductionProposal',
            fromDate: $fromDate,
            toDate: $toDate,
            days: $this->days(fromDate: $fromDate, toDate: $toDate),
            toCook: $toCook,
            covered: $covered,
        );
    }

    /**
     * @param array<string, float> $stock
     * @param array<string, float> $inProduction
     */
    private function deficitOf(float $demand, string $recipeId, array $stock, array $inProduction): float
    {
        $available = ($stock[$recipeId] ?? 0.0) + ($inProduction[$recipeId] ?? 0.0);

        return round(num: $demand - $available, precision: ProductionItem::SERVINGS_PRECISION);
    }

    /**
     * @param string[] $recipeIds
     *
     * @return string[]
     */
    private function cookingOrder(array $recipeIds): array
    {
        $ordered = [];
        $visiting = [];

        foreach ($recipeIds as $recipeId) {
            $this->visit(recipeId: $recipeId, ordered: $ordered, visiting: $visiting);
        }

        return array_keys($ordered);
    }

    /**
     * @param array<string, true> $ordered
     * @param array<string, true> $visiting
     */
    private function visit(string $recipeId, array &$ordered, array &$visiting): void
    {
        if (isset($ordered[$recipeId]) || isset($visiting[$recipeId])) {
            return;
        }

        $visiting[$recipeId] = true;

        foreach ($this->ingredientResolver->resolveDirect(recipeId: $recipeId, servings: 1.0)->subRecipes as $subRecipe) {
            $this->visit(recipeId: $subRecipe->recipeId, ordered: $ordered, visiting: $visiting);
        }

        unset($visiting[$recipeId]);
        $ordered[$recipeId] = true;
    }

    /**
     * @return array<string, float>
     */
    private function demandByRecipe(string $fromDate, string $toDate): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('d.ref_id', 'SUM(d.quantity) AS servings')
            ->from(table: 'diary_entry', alias: 'd')
            ->where('d.entry_date BETWEEN :fromDate AND :toDate')
            ->andWhere('d.kind = :kind')
            ->andWhere('d.ref_id IS NOT NULL')
            ->setParameter(key: 'fromDate', value: $fromDate)
            ->setParameter(key: 'toDate', value: $toDate)
            ->setParameter(key: 'kind', value: DiaryEntry::KIND_RECIPE)
            ->groupBy('d.ref_id')
            ->executeQuery()
            ->fetchAllAssociative();

        $demand = [];

        foreach ($rows as $row) {
            $demand[$row['ref_id']] = round(num: (float) $row['servings'], precision: ProductionItem::SERVINGS_PRECISION);
        }

        return $demand;
    }

    /**
     * @param string[] $recipeIds
     *
     * @return array<string, float>
     */
    private function stockByRecipe(array $recipeIds): array
    {
        if ([] === $recipeIds) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('s.recipe_id', 's.servings')
            ->from(table: 'recipe_stock', alias: 's')
            ->where('s.recipe_id IN (:recipeIds)')
            ->setParameter(key: 'recipeIds', value: $recipeIds, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $stock = [];

        foreach ($rows as $row) {
            $stock[$row['recipe_id']] = (float) $row['servings'];
        }

        return $stock;
    }

    /**
     * @param string[] $recipeIds
     *
     * @return array<string, float>
     */
    private function plannedByRecipe(array $recipeIds): array
    {
        if ([] === $recipeIds) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('i.recipe_id', 'SUM(i.servings_planned) AS servings')
            ->from(table: 'production_item', alias: 'i')
            ->innerJoin(fromAlias: 'i', join: 'production', alias: 'p', condition: 'p.id = i.production_id')
            ->where('i.recipe_id IN (:recipeIds)')
            ->andWhere('i.status = :itemStatus')
            ->andWhere('p.status = :productionStatus')
            ->setParameter(key: 'recipeIds', value: $recipeIds, type: ArrayParameterType::STRING)
            ->setParameter(key: 'itemStatus', value: ProductionItem::STATUS_PENDING)
            ->setParameter(key: 'productionStatus', value: Production::STATUS_COOKING)
            ->groupBy('i.recipe_id')
            ->executeQuery()
            ->fetchAllAssociative();

        $planned = [];

        foreach ($rows as $row) {
            $planned[$row['recipe_id']] = round(num: (float) $row['servings'], precision: ProductionItem::SERVINGS_PRECISION);
        }

        return $planned;
    }

    /**
     * @param string[] $recipeIds
     *
     * @return array<string, array{name: string, emoji: string, image: ?string}>
     */
    private function recipesById(array $recipeIds): array
    {
        if ([] === $recipeIds) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('r.id', 'r.name', 'r.emoji', 'r.image')
            ->from(table: 'recipe', alias: 'r')
            ->where('r.id IN (:recipeIds)')
            ->setParameter(key: 'recipeIds', value: $recipeIds, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $recipes = [];

        foreach ($rows as $row) {
            $recipes[$row['id']] = ['name' => $row['name'], 'emoji' => $row['emoji'], 'image' => $row['image']];
        }

        return $recipes;
    }

    private function days(string $fromDate, string $toDate): int
    {
        $from = new \DateTimeImmutable(datetime: $fromDate);
        $to = new \DateTimeImmutable(datetime: $toDate);

        return (int) $from->diff(targetObject: $to)->days + 1;
    }

    /**
     * @param array<string, array{unit: string, quantity: float}> $packs
     */
    private function packHint(string $recipeId, float $deficit, array $packs): ?ProposalPackHint
    {
        $candidate = $this->bestPackCandidate(recipeId: $recipeId, deficit: $deficit, packs: $packs);

        if (null === $candidate) {
            return null;
        }

        $suggestedServings = floor(num: $deficit * $candidate->uplift);

        if ($suggestedServings <= $deficit) {
            return null;
        }

        return new ProposalPackHint(
            articleId: $candidate->ingredient->articleId,
            articleName: $candidate->ingredient->name,
            packUnit: $candidate->packUnit,
            packQuantity: $candidate->packQuantity,
            unit: $candidate->ingredient->baseUnit,
            neededQuantity: $candidate->ingredient->baseQuantity,
            suggestedServings: $suggestedServings,
        );
    }

    /**
     * @param array<string, array{unit: string, quantity: float}> $packs
     */
    private function bestPackCandidate(string $recipeId, float $deficit, array $packs): ?ProposalPackCandidate
    {
        $candidate = null;

        foreach ($this->ingredientResolver->resolve(recipeId: $recipeId, servings: $deficit) as $ingredient) {
            $pack = $packs[$ingredient->articleId] ?? null;

            if (null === $pack || $ingredient->baseQuantity <= 0.0) {
                continue;
            }

            $uplift = $pack['quantity'] / $ingredient->baseQuantity;

            if ($uplift <= 1.0 || $uplift > self::MAX_PACK_UPLIFT) {
                continue;
            }

            if (null !== $candidate && $candidate->ingredient->baseQuantity >= $ingredient->baseQuantity) {
                continue;
            }

            $candidate = new ProposalPackCandidate(
                ingredient: $ingredient,
                packUnit: $pack['unit'],
                packQuantity: $pack['quantity'],
                uplift: $uplift,
            );
        }

        return $candidate;
    }

    /**
     * @return array<string, array{unit: string, quantity: float}>
     */
    private function packsByArticle(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('a.id', 'a.pack_unit', 'e.quantity')
            ->from(table: 'article', alias: 'a')
            ->innerJoin(fromAlias: 'a', join: 'article_equivalence', alias: 'e', condition: 'e.article_id = a.id AND e.unit = a.pack_unit')
            ->where('a.pack_unit IS NOT NULL')
            ->executeQuery()
            ->fetchAllAssociative();

        $packs = [];

        foreach ($rows as $row) {
            $packs[$row['id']] = ['unit' => $row['pack_unit'], 'quantity' => (float) $row['quantity']];
        }

        return $packs;
    }
}
