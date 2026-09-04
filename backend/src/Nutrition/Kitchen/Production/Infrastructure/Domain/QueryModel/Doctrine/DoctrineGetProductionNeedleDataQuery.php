<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionResult;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionItemView;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionNeedleDataQuery;

final readonly class DoctrineGetProductionNeedleDataQuery implements GetProductionNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineProductionIngredientResolver $ingredientResolver,
    ) {
    }

    public function findProductionById(string $productionId): ?GetProductionResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                'p.id',
                'p.from_date',
                'p.to_date',
                'p.status',
                'p.created_at',
                'p.updated_at',
                'p.created_by_user_id',
                'p.updated_by_user_id'
            )
            ->from(table: 'production', alias: 'p')
            ->where('p.id = :productionId')
            ->setParameter(key: 'productionId', value: $productionId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $items = $this->items(productionId: $productionId);
        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetProductionResult(
            id: $row['id'],
            aggregateName: 'Production',
            fromDate: $row['from_date'],
            toDate: $row['to_date'],
            status: $row['status'],
            items: $items,
            servingsPlanned: $this->sum(servings: array_map(
                callback: static fn (ProductionItemView $item): float => $item->servingsPlanned,
                array: $items,
            )),
            servingsCooked: $this->sum(servings: array_map(
                callback: static fn (ProductionItemView $item): float => $item->servingsCooked,
                array: $items,
            )),
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    /**
     * @return ProductionItemView[]
     */
    private function items(string $productionId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'i.id',
                'i.recipe_id',
                'i.status',
                'i.servings_planned',
                'i.servings_cooked',
                'i.name_snapshot',
                'i.emoji_snapshot',
                'i.code',
                'i.label',
                'i.customized',
                'r.image'
            )
            ->from(table: 'production_item', alias: 'i')
            ->leftJoin(fromAlias: 'i', join: 'recipe', alias: 'r', condition: 'r.id = i.recipe_id')
            ->where('i.production_id = :productionId')
            ->setParameter(key: 'productionId', value: $productionId)
            ->orderBy('i.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $requiredBy = $this->requiredBy(rows: $rows);

        return array_map(callback: static fn (array $row): ProductionItemView => new ProductionItemView(
            itemId: $row['id'],
            recipeId: $row['recipe_id'],
            name: $row['name_snapshot'],
            emoji: $row['emoji_snapshot'],
            image: $row['image'],
            status: $row['status'],
            servingsPlanned: (float) $row['servings_planned'],
            servingsCooked: (float) $row['servings_cooked'],
            code: $row['code'],
            label: (string) ($row['label'] ?? ''),
            customized: (bool) $row['customized'],
            requiredBy: $requiredBy[$row['recipe_id']] ?? [],
        ), array: $rows);
    }

    /**
     * @param array<int, array<string, mixed>> $rows
     *
     * @return array<string, string[]>
     */
    private function requiredBy(array $rows): array
    {
        $names = array_column(array: $rows, column_key: 'name_snapshot', index_key: 'recipe_id');
        $requiredBy = [];

        foreach ($rows as $row) {
            $needs = $this->ingredientResolver->resolveDirect(recipeId: $row['recipe_id'], servings: 1.0);

            foreach ($needs->subRecipes as $subRecipe) {
                if (!isset($names[$subRecipe->recipeId])) {
                    continue;
                }

                $requiredBy[$subRecipe->recipeId][] = $row['name_snapshot'];
            }
        }

        return $requiredBy;
    }

    /**
     * @param float[] $servings
     */
    private function sum(array $servings): float
    {
        return round(num: array_sum(array: $servings), precision: ProductionItem::SERVINGS_PRECISION);
    }
}
