<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\BalanceCheck\Domain\QueryModel\SetFinanceAccountBalanceNeedleDataQuery;

final readonly class DoctrineSetFinanceAccountBalanceNeedleDataQuery implements SetFinanceAccountBalanceNeedleDataQuery
{
    private const KIND_INCOME = 'income';

    public function __construct(
        private Connection $connection,
    ) {
    }

    public function netMovements(string $accountId, string $checkDate): float
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.kind', 'SUM(t.amount) AS total')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('t.account_id = :accountId')
            ->andWhere('t.transaction_date = :checkDate')
            ->setParameter(key: 'accountId', value: $accountId)
            ->setParameter(key: 'checkDate', value: $checkDate)
            ->groupBy('t.kind')
            ->executeQuery()
            ->fetchAllAssociative();

        $net = 0.0;

        foreach ($rows as $row) {
            $total = (float) $row['total'];
            $net += self::KIND_INCOME === $row['kind'] ? $total : -$total;
        }

        return round(num: $net, precision: 2);
    }
}
