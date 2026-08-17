<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\BalanceCheck\Domain\QueryModel\CreateFinanceBalanceCheckNeedleDataQuery;

final readonly class DoctrineCreateFinanceBalanceCheckNeedleDataQuery implements CreateFinanceBalanceCheckNeedleDataQuery
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

    public function alreadyExists(string $accountId, string $checkDate): bool
    {
        $total = $this->connection->createQueryBuilder()
            ->select('COUNT(c.id)')
            ->from(table: 'finance_balance_check', alias: 'c')
            ->where('c.account_id = :accountId')
            ->andWhere('c.check_date = :checkDate')
            ->setParameter(key: 'accountId', value: $accountId)
            ->setParameter(key: 'checkDate', value: $checkDate)
            ->executeQuery()
            ->fetchOne();

        return (int) $total > 0;
    }
}
