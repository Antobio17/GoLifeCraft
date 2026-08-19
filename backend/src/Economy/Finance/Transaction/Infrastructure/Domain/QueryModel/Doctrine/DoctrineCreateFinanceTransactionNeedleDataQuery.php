<?php

namespace Economy\Finance\Transaction\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
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

    public function recurrenceMovementExists(
        string $accountId,
        string $month,
        string $kind,
        float $amount,
        string $note,
    ): bool {
        $total = $this->connection->createQueryBuilder()
            ->select('COUNT(t.id)')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('t.account_id = :accountId')
            ->andWhere('t.transaction_date LIKE :month')
            ->andWhere('t.kind = :kind')
            ->andWhere('ROUND(t.amount, 2) = :amount')
            ->andWhere('t.note = :note')
            ->andWhere('t.source = :source')
            ->setParameter(key: 'accountId', value: $accountId)
            ->setParameter(key: 'month', value: $month.'%')
            ->setParameter(key: 'kind', value: $kind)
            ->setParameter(key: 'amount', value: round(num: $amount, precision: 2))
            ->setParameter(key: 'note', value: $note)
            ->setParameter(key: 'source', value: FinanceTransaction::SOURCE_RECURRENCE)
            ->executeQuery()
            ->fetchOne();

        return (int) $total > 0;
    }
}
