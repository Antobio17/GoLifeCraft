<?php

namespace Economy\Finance\Account\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Account\Domain\QueryModel\UpdateFinanceAccountNeedleDataQuery;

final readonly class DoctrineUpdateFinanceAccountNeedleDataQuery implements UpdateFinanceAccountNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function alreadyExists(string $name, string $financeAccountId): bool
    {
        $total = $this->connection->createQueryBuilder()
            ->select('COUNT(a.id)')
            ->from(table: 'finance_account', alias: 'a')
            ->where('a.name = :name')
            ->andWhere('a.id != :id')
            ->setParameter(key: 'name', value: $name)
            ->setParameter(key: 'id', value: $financeAccountId)
            ->executeQuery()
            ->fetchOne();

        return (int) $total > 0;
    }
}
