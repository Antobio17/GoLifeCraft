<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\Service\ProductionLotAllocator;
use Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine\ProductionLotServings;

final readonly class DoctrineProductionLotAllocator implements ProductionLotAllocator
{
    private const string END_OF_DAY = ' 23:59:59';

    public function __construct(private Connection $connection)
    {
    }

    public function findLotWithRoom(string $recipeId, float $servings, ?string $cookedOnOrBefore = null): ?string
    {
        $queryBuilder = $this->connection->createQueryBuilder()
            ->select('i.id')
            ->from(table: 'production_item', alias: 'i')
            ->where('i.recipe_id = :recipeId')
            ->andWhere('i.status = :status')
            ->andWhere(sprintf('%s >= :servings', ProductionLotServings::free(itemAlias: 'i')))
            ->orderBy('i.updated_at', 'ASC')
            ->setMaxResults(1)
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->setParameter(key: 'status', value: ProductionItem::STATUS_DONE)
            ->setParameter(key: 'servings', value: $servings);

        if (null !== $cookedOnOrBefore) {
            $queryBuilder
                ->andWhere('i.updated_at <= :cookedOnOrBefore')
                ->setParameter(key: 'cookedOnOrBefore', value: $cookedOnOrBefore.self::END_OF_DAY);
        }

        $productionItemId = $queryBuilder->executeQuery()->fetchOne();

        return false === $productionItemId ? null : $productionItemId;
    }
}
