<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetRecipeLotsResult;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetRecipeLotsNeedleDataQuery;

final readonly class DoctrineGetRecipeLotsNeedleDataQuery implements GetRecipeLotsNeedleDataQuery
{
    private const int MAX_LOTS = 50;

    public function __construct(private Connection $connection)
    {
    }

    public function findLots(string $recipeId): array
    {
        $queryBuilder = $this->connection->createQueryBuilder()
            ->select(
                'i.id',
                'i.production_id',
                'i.recipe_id',
                'i.name_snapshot',
                'i.emoji_snapshot',
                'i.code',
                'i.label',
                'i.customized',
                'i.servings_cooked',
                'i.updated_at',
                'i.created_at',
                'i.created_by_user_id',
                'i.updated_by_user_id',
                ProductionLotServings::assigned(itemAlias: 'i').' AS servings_assigned'
            )
            ->from(table: 'production_item', alias: 'i')
            ->where('i.recipe_id = :recipeId')
            ->andWhere('i.status = :status')
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->setParameter(key: 'status', value: ProductionItem::STATUS_DONE)
            ->orderBy('i.updated_at', 'DESC')
            ->setMaxResults(self::MAX_LOTS);

        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: static function (array $row) use ($utc): GetRecipeLotsResult {
            $cooked = (float) $row['servings_cooked'];
            $assigned = (float) $row['servings_assigned'];

            return new GetRecipeLotsResult(
                id: $row['id'],
                aggregateName: 'ProductionLot',
                productionId: $row['production_id'],
                recipeId: $row['recipe_id'],
                name: $row['name_snapshot'],
                emoji: $row['emoji_snapshot'],
                code: $row['code'],
                label: (string) ($row['label'] ?? ''),
                customized: (bool) $row['customized'],
                cookedOn: substr(string: (string) $row['updated_at'], offset: 0, length: 10),
                servingsCooked: $cooked,
                servingsAssigned: round(num: $assigned, precision: ProductionItem::SERVINGS_PRECISION),
                servingsLeft: round(num: $cooked - $assigned, precision: ProductionItem::SERVINGS_PRECISION),
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );
        }, array: $queryBuilder->executeQuery()->fetchAllAssociative());
    }
}
