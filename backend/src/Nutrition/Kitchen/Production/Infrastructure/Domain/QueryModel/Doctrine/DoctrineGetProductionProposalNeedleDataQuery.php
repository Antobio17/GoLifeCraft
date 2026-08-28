<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionProposalResult;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProposalCoveredItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProposalPackHint;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProposalToCookItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionProposalNeedleDataQuery;

final readonly class DoctrineGetProductionProposalNeedleDataQuery implements GetProductionProposalNeedleDataQuery
{
    /**
     * A whole pack has to cover at most this much more than the deficit for the hint to be worth
     * showing: buying one pack of saffron is not a reason to cook forty servings.
     */
    private const float MAX_PACK_UPLIFT = 2.0;

    public function __construct(
        private Connection $connection,
        private DoctrineProductionIngredientResolver $ingredientResolver,
    ) {
    }

    /**
     * The whole point of the range: the diary is summed across every day in it, so two days asking
     * for three servings each become one batch of six instead of two separate cooking sessions.
     *
     * A composite recipe pulls its sub-recipes into the batch as lines of their own, because a
     * sub-recipe is an ingredient with a balance: cooking the parent spends its servings, and those
     * servings have to be cooked by somebody. They come out ordered children first, which is the
     * order you cook them in.
     */
    public function findProposal(string $fromDate, string $toDate): GetProductionProposalResult
    {
        $demand = $this->demandByRecipe(fromDate: $fromDate, toDate: $toDate);
        $order = $this->cookingOrder(recipeIds: array_keys($demand));
        $recipes = $this->recipesById(recipeIds: $order);
        $stock = $this->stockByRecipe(recipeIds: $order);
        $inProduction = $this->plannedByRecipe(recipeIds: $order);

        $requiredBy = [];

        foreach (array_reverse(array: $order) as $recipeId) {
            $available = ($stock[$recipeId] ?? 0.0) + ($inProduction[$recipeId] ?? 0.0);
            $deficit = round(num: ($demand[$recipeId] ?? 0.0) - $available, precision: 2);

            if ($deficit <= 0.0) {
                continue;
            }

            foreach ($this->ingredientResolver->resolveDirect(recipeId: $recipeId, servings: $deficit)->subRecipes as $subRecipe) {
                $demand[$subRecipe->recipeId] = round(
                    num: ($demand[$subRecipe->recipeId] ?? 0.0) + $subRecipe->servings,
                    precision: 2,
                );
                $requiredBy[$subRecipe->recipeId][] = $recipes[$recipeId]['name'] ?? '';
            }
        }

        $toCook = [];
        $covered = [];

        foreach ($order as $recipeId) {
            $recipe = $recipes[$recipeId] ?? null;
            if (null === $recipe) {
                continue;
            }

            $servings = $demand[$recipeId] ?? 0.0;

            if ($servings <= 0.0) {
                continue;
            }

            $available = ($stock[$recipeId] ?? 0.0) + ($inProduction[$recipeId] ?? 0.0);
            $deficit = round(num: $servings - $available, precision: 2);

            if ($deficit <= 0.0) {
                $covered[] = new ProposalCoveredItem(
                    recipeId: $recipeId,
                    name: $recipe['name'],
                    emoji: $recipe['emoji'],
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
                demand: $servings,
                inStock: $stock[$recipeId] ?? 0.0,
                inProduction: $inProduction[$recipeId] ?? 0.0,
                deficit: $deficit,
                requiredBy: array_values(array: array_unique(array: $requiredBy[$recipeId] ?? [])),
                packHint: $this->packHint(recipeId: $recipeId, deficit: $deficit),
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
     * Depth-first over the recipe tree, deepest first: a sub-recipe has to be cooked before the
     * recipe that eats it, and it may be shared by two parents, so it appears only once.
     *
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
            $demand[$row['ref_id']] = round(num: (float) $row['servings'], precision: 2);
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
     * Servings already planned in a batch that is still cooking. Without this the proposal would
     * keep asking for what you are already standing in the kitchen making.
     *
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
            $planned[$row['recipe_id']] = round(num: (float) $row['servings'], precision: 2);
        }

        return $planned;
    }

    /**
     * @param string[] $recipeIds
     *
     * @return array<string, array{name: string, emoji: string}>
     */
    private function recipesById(array $recipeIds): array
    {
        if ([] === $recipeIds) {
            return [];
        }

        $rows = $this->connection->createQueryBuilder()
            ->select('r.id', 'r.name', 'r.emoji')
            ->from(table: 'recipe', alias: 'r')
            ->where('r.id IN (:recipeIds)')
            ->setParameter(key: 'recipeIds', value: $recipeIds, type: ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $recipes = [];

        foreach ($rows as $row) {
            $recipes[$row['id']] = ['name' => $row['name'], 'emoji' => $row['emoji']];
        }

        return $recipes;
    }

    private function days(string $fromDate, string $toDate): int
    {
        $from = new \DateTimeImmutable(datetime: $fromDate);
        $to = new \DateTimeImmutable(datetime: $toDate);

        return (int) $from->diff(targetObject: $to)->days + 1;
    }

    private function packHint(string $recipeId, float $deficit): ?ProposalPackHint
    {
        $packs = $this->packsByArticle();
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

            if (null !== $candidate && $candidate['ingredient']->baseQuantity >= $ingredient->baseQuantity) {
                continue;
            }

            $candidate = ['ingredient' => $ingredient, 'pack' => $pack, 'uplift' => $uplift];
        }

        if (null === $candidate) {
            return null;
        }

        return $this->toPackHint(candidate: $candidate, deficit: $deficit);
    }

    /**
     * Rounded down so the suggestion never overshoots the pack: the point is filling the format
     * you are going to open anyway, not opening a second one.
     *
     * @param array{ingredient: \Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient, pack: array{unit: string, quantity: float}, uplift: float} $candidate
     */
    private function toPackHint(array $candidate, float $deficit): ?ProposalPackHint
    {
        $suggestedServings = floor(num: $deficit * $candidate['uplift']);

        if ($suggestedServings <= $deficit) {
            return null;
        }

        return new ProposalPackHint(
            articleId: $candidate['ingredient']->articleId,
            articleName: $candidate['ingredient']->name,
            packUnit: $candidate['pack']['unit'],
            packQuantity: $candidate['pack']['quantity'],
            unit: $candidate['ingredient']->baseUnit,
            neededQuantity: $candidate['ingredient']->baseQuantity,
            suggestedServings: $suggestedServings,
        );
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
