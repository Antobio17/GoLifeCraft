<?php

namespace Economy\Finance\Account\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Account\Domain\QueryModel\DeleteFinanceAccountNeedleDataQuery;

final readonly class DoctrineDeleteFinanceAccountNeedleDataQuery implements DeleteFinanceAccountNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function hasTransactions(string $financeAccountId): bool
    {
        $total = $this->connection->createQueryBuilder()
            ->select('COUNT(t.id)')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('t.account_id = :accountId')
            ->setParameter(key: 'accountId', value: $financeAccountId)
            ->executeQuery()
            ->fetchOne();

        return (int) $total > 0;
    }
}
