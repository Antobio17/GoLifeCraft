<?php

namespace Economy\Finance\Transaction\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\FinanceTransactionView;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceTransactionsResult;
use Economy\Finance\Transaction\Domain\QueryModel\GetFinanceTransactionsNeedleDataQuery;

final readonly class DoctrineGetFinanceTransactionsNeedleDataQuery implements GetFinanceTransactionsNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findTransactions(string $month, ?string $date): GetFinanceTransactionsResult
    {
        $builder = $this->connection->createQueryBuilder()
            ->select(
                't.id',
                't.account_id',
                'a.name AS account_name',
                't.transaction_date',
                't.kind',
                't.amount',
                't.category',
                't.note',
                't.store',
                't.source',
            )
            ->from(table: 'finance_transaction', alias: 't')
            ->innerJoin('t', 'finance_account', 'a', 'a.id = t.account_id')
            ->orderBy('t.transaction_date', 'DESC')
            ->addOrderBy('t.created_at', 'DESC');

        if (null === $date) {
            $builder
                ->where('SUBSTRING(t.transaction_date, 1, 7) = :month')
                ->setParameter(key: 'month', value: $month);
        }

        if (null !== $date) {
            $builder
                ->where('t.transaction_date = :date')
                ->setParameter(key: 'date', value: $date);
        }

        $rows = $builder->executeQuery()->fetchAllAssociative();

        $transactions = [];
        $income = 0.0;
        $expense = 0.0;

        foreach ($rows as $row) {
            $amount = round(num: (float) $row['amount'], precision: 2);
            $kind = (string) $row['kind'];

            if (FinanceTransaction::KIND_INCOME === $kind) {
                $income += $amount;
            }

            if (FinanceTransaction::KIND_INCOME !== $kind) {
                $expense += $amount;
            }

            $transactions[] = new FinanceTransactionView(
                id: (string) $row['id'],
                accountId: (string) $row['account_id'],
                accountName: (string) $row['account_name'],
                transactionDate: (string) $row['transaction_date'],
                kind: $kind,
                amount: $amount,
                category: (string) $row['category'],
                note: (string) $row['note'],
                store: $row['store'],
                source: (string) $row['source'],
            );
        }

        return new GetFinanceTransactionsResult(
            id: $date ?? $month,
            aggregateName: 'FinanceTransactions',
            month: $month,
            date: $date,
            transactions: $transactions,
            transactionCount: count(value: $transactions),
            income: round(num: $income, precision: 2),
            expense: round(num: $expense, precision: 2),
        );
    }
}
