<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\QueryModel\FindDiaryEntryLotNeedleDataQuery;
use Nutrition\Kitchen\Production\Domain\Service\ProductionLotAllocator;

final readonly class DoctrineFindDiaryEntryLotNeedleDataQuery implements FindDiaryEntryLotNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private ProductionLotAllocator $lotAllocator,
    ) {
    }

    public function findLotWithRoom(string $recipeId, string $entryDate, float $servings): ?string
    {
        return $this->lotAllocator->findLotWithRoom(
            recipeId: $recipeId,
            servings: $servings,
            cookedOnOrBefore: $entryDate,
        );
    }

    public function findEntriesToAttach(string $recipeId, string $cookedOn, float $servings): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('d.id', 'd.quantity')
            ->from(table: 'diary_entry', alias: 'd')
            ->where('d.kind = :kind')
            ->andWhere('d.ref_id = :recipeId')
            ->andWhere('d.entry_date >= :cookedOn')
            ->andWhere('d.production_item_id IS NULL')
            ->andWhere('d.consumed = 0')
            ->setParameter(key: 'kind', value: DiaryEntry::KIND_RECIPE)
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->setParameter(key: 'cookedOn', value: $cookedOn)
            ->orderBy('d.entry_date', 'ASC')
            ->addOrderBy('d.created_at', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $entryIds = [];
        $left = $servings;

        foreach ($rows as $row) {
            $quantity = (float) $row['quantity'];

            if ($quantity > $left) {
                break;
            }

            $entryIds[] = $row['id'];
            $left -= $quantity;
        }

        return $entryIds;
    }

    public function findEntriesOfLot(string $productionItemId): array
    {
        return $this->connection->createQueryBuilder()
            ->select('d.id')
            ->from(table: 'diary_entry', alias: 'd')
            ->where('d.production_item_id = :productionItemId')
            ->setParameter(key: 'productionItemId', value: $productionItemId)
            ->executeQuery()
            ->fetchFirstColumn();
    }
}
