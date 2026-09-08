<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\QueryModel\ReopenInventoryNeedleDataQuery;

final readonly class DoctrineReopenInventoryNeedleDataQuery implements ReopenInventoryNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function openInventoryId(): ?string
    {
        $result = $this->connection->createQueryBuilder()
            ->select('i.id')
            ->from(table: 'inventory', alias: 'i')
            ->where('i.status = :status')
            ->setParameter(key: 'status', value: Inventory::STATUS_DRAFT)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false === $result ? null : (string) $result;
    }
}
