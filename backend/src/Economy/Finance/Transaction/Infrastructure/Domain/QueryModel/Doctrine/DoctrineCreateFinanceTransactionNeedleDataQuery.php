<?php

namespace Economy\Finance\Transaction\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Transaction\Domain\QueryModel\CreateFinanceTransactionNeedleDataQuery;

final readonly class DoctrineCreateFinanceTransactionNeedleDataQuery implements CreateFinanceTransactionNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function accountExists(string $accountId): bool
    {
        $total = $this->connection->createQueryBuilder()
            ->select('COUNT(a.id)')
            ->from(table: 'finance_account', alias: 'a')
            ->where('a.id = :accountId')
            ->setParameter(key: 'accountId', value: $accountId)
            ->executeQuery()
            ->fetchOne();

        return (int) $total > 0;
    }
}
