<?php

namespace Economy\Finance\Recurrence\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Recurrence\Domain\QueryModel\FindFinanceRecurrencesByAccountNeedleDataQuery;

final readonly class DoctrineFindFinanceRecurrencesByAccountNeedleDataQuery implements FindFinanceRecurrencesByAccountNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findIdsByAccount(string $accountId): array
    {
        return $this->connection->createQueryBuilder()
            ->select('r.id')
            ->from(table: 'finance_recurrence', alias: 'r')
            ->where('r.account_id = :accountId')
            ->setParameter(key: 'accountId', value: $accountId)
            ->executeQuery()
            ->fetchFirstColumn();
    }
}
