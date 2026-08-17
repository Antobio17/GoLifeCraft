<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\BalanceCheck\Domain\QueryModel\UpdateFinanceBalanceCheckNeedleDataQuery;

final readonly class DoctrineUpdateFinanceBalanceCheckNeedleDataQuery implements UpdateFinanceBalanceCheckNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function alreadyExists(string $accountId, string $checkDate, string $financeBalanceCheckId): bool
    {
        $total = $this->connection->createQueryBuilder()
            ->select('COUNT(c.id)')
            ->from(table: 'finance_balance_check', alias: 'c')
            ->where('c.account_id = :accountId')
            ->andWhere('c.check_date = :checkDate')
            ->andWhere('c.id != :id')
            ->setParameter(key: 'accountId', value: $accountId)
            ->setParameter(key: 'checkDate', value: $checkDate)
            ->setParameter(key: 'id', value: $financeBalanceCheckId)
            ->executeQuery()
            ->fetchOne();

        return (int) $total > 0;
    }
}
