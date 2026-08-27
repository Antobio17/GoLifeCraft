<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetKitchenDayResult;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\KitchenDayDoneItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\KitchenDayExpectedItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\KitchenDayPackHint;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\KitchenDayToCookItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\KitchenDayWeekDay;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetKitchenDayNeedleDataQuery;

final readonly class DoctrineGetKitchenDayNeedleDataQuery implements GetKitchenDayNeedleDataQuery
{
    private const int WEEK_DAYS = 7;

    /**
     * Nested DTOs never reach the date normalisation of JsonResponseBuilder, which only walks the
     * top level of the aggregate, so this one is formatted here with the same rule it applies.
     */
    private const string LOCAL_TIME_ZONE = 'Europe/Madrid';

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

    public function findKitchenDay(string $date): GetKitchenDayResult
    {
        $demand = $this->demandByRecipe(date: $date);
        $stock = $this->stockByRecipe(recipeIds: array_keys($demand));
        $recipes = $this->recipesById(recipeIds: array_keys($demand));

        $toCook = [];
        $expected = [];

        foreach ($demand as $recipeId => $servings) {
            $recipe = $recipes[$recipeId] ?? null;
            if (null === $recipe) {
                continue;
            }

            $inStock = $stock[$recipeId] ?? 0.0;
            $deficit = round(num: $servings - $inStock, precision: 2);

            if ($deficit <= 0.0) {
                $expected[] = new KitchenDayExpectedItem(
                    recipeId: $recipeId,
                    name: $recipe['name'],
                    emoji: $recipe['emoji'],
                    inStock: $inStock,
                );

                continue;
            }

            $toCook[] = new KitchenDayToCookItem(
                recipeId: $recipeId,
                name: $recipe['name'],
                emoji: $recipe['emoji'],
                demand: $servings,
                inStock: $inStock,
                deficit: $deficit,
                packHint: $this->packHint(recipeId: $recipeId, deficit: $deficit),
            );
        }

        return new GetKitchenDayResult(
            id: $date,
            aggregateName: 'KitchenDay',
            date: $date,
            toCook: $toCook,
            expected: $expected,
            done: $this->doneProductions(date: $date),
            weekDays: $this->weekDays(date: $date),
        );
    }

    /**
     * @return array<string, float>
     */
    private function demandByRecipe(string $date): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('d.ref_id', 'SUM(d.quantity) AS servings')
            ->from(table: 'diary_entry', alias: 'd')
            ->where('d.entry_date = :date')
            ->andWhere('d.kind = :kind')
            ->andWhere('d.ref_id IS NOT NULL')
            ->setParameter(key: 'date', value: $date)
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
            ->setParameter(key: 'recipeIds', value: $recipeIds, type: \Doctrine\DBAL\ArrayParameterType::STRING)
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
            ->setParameter(key: 'recipeIds', value: $recipeIds, type: \Doctrine\DBAL\ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $recipes = [];

        foreach ($rows as $row) {
            $recipes[$row['id']] = ['name' => $row['name'], 'emoji' => $row['emoji']];
        }

        return $recipes;
    }

    /**
     * @return KitchenDayDoneItem[]
     */
    private function doneProductions(string $date): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('p.id', 'p.recipe_id', 'p.name_snapshot', 'p.emoji_snapshot', 'p.servings_cooked', 'p.updated_at')
            ->from(table: 'production', alias: 'p')
            ->where('p.cook_date = :date')
            ->andWhere('p.status = :status')
            ->setParameter(key: 'date', value: $date)
            ->setParameter(key: 'status', value: Production::STATUS_DONE)
            ->orderBy('p.updated_at', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $utc = new \DateTimeZone(timezone: 'UTC');
        $local = new \DateTimeZone(timezone: self::LOCAL_TIME_ZONE);

        return array_map(callback: static fn (array $row): KitchenDayDoneItem => new KitchenDayDoneItem(
            productionId: $row['id'],
            recipeId: $row['recipe_id'],
            name: $row['name_snapshot'],
            emoji: $row['emoji_snapshot'],
            servingsCooked: (float) $row['servings_cooked'],
            cookedAt: (new \DateTime(datetime: $row['updated_at'], timezone: $utc))
                ->setTimezone(timezone: $local)
                ->format(format: \DateTime::ATOM),
        ), array: $rows);
    }

    /**
     * @return KitchenDayWeekDay[]
     */
    private function weekDays(string $date): array
    {
        $monday = (new \DateTimeImmutable(datetime: $date))->modify(modifier: 'monday this week');
        $dates = [];

        for ($offset = 0; $offset < self::WEEK_DAYS; ++$offset) {
            $dates[] = $monday->modify(modifier: sprintf('+%d days', $offset))->format(format: 'Y-m-d');
        }

        $withItems = $this->datesWithItems(dates: $dates);

        return array_map(callback: static fn (string $day): KitchenDayWeekDay => new KitchenDayWeekDay(
            date: $day,
            hasItems: in_array(needle: $day, haystack: $withItems, strict: true),
        ), array: $dates);
    }

    /**
     * @param string[] $dates
     *
     * @return string[]
     */
    private function datesWithItems(array $dates): array
    {
        $planned = $this->connection->createQueryBuilder()
            ->select('DISTINCT d.entry_date')
            ->from(table: 'diary_entry', alias: 'd')
            ->where('d.entry_date IN (:dates)')
            ->andWhere('d.kind = :kind')
            ->setParameter(key: 'dates', value: $dates, type: \Doctrine\DBAL\ArrayParameterType::STRING)
            ->setParameter(key: 'kind', value: DiaryEntry::KIND_RECIPE)
            ->executeQuery()
            ->fetchFirstColumn();

        $cooked = $this->connection->createQueryBuilder()
            ->select('DISTINCT p.cook_date')
            ->from(table: 'production', alias: 'p')
            ->where('p.cook_date IN (:dates)')
            ->setParameter(key: 'dates', value: $dates, type: \Doctrine\DBAL\ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchFirstColumn();

        return array_values(array: array_unique(array: array_merge($planned, $cooked)));
    }

    private function packHint(string $recipeId, float $deficit): ?KitchenDayPackHint
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
    private function toPackHint(array $candidate, float $deficit): ?KitchenDayPackHint
    {
        $suggestedServings = floor(num: $deficit * $candidate['uplift']);

        if ($suggestedServings <= $deficit) {
            return null;
        }

        return new KitchenDayPackHint(
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
