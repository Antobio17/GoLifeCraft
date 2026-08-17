<?php

namespace Economy\Finance\Account\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Account\Domain\QueryModel\CreateFinanceAccountNeedleDataQuery;

final readonly class DoctrineCreateFinanceAccountNeedleDataQuery implements CreateFinanceAccountNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function alreadyExists(string $name): bool
    {
        $total = $this->connection->createQueryBuilder()
            ->select('COUNT(a.id)')
            ->from(table: 'finance_account', alias: 'a')
            ->where('a.name = :name')
            ->setParameter(key: 'name', value: $name)
            ->executeQuery()
            ->fetchOne();

        return (int) $total > 0;
    }
}
