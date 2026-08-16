<?php

namespace Economy\Finance\Transaction\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\FinanceCategoryTotal;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\FinanceMonthPoint;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\FinanceStoreTotal;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\FinanceSubscription;
use Economy\Finance\Transaction\Domain\QueryModel\Dto\GetFinanceOverviewResult;
use Economy\Finance\Transaction\Domain\QueryModel\GetFinanceOverviewNeedleDataQuery;

final readonly class DoctrineGetFinanceOverviewNeedleDataQuery implements GetFinanceOverviewNeedleDataQuery
{
    private const SERIES_MONTHS = 6;
    private const AVERAGE_MONTHS = 3;
    private const OVERSPENDING_THRESHOLD = 1.08;
    private const TOP_STORES = 6;

    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findOverview(string $month, string $today): GetFinanceOverviewResult
    {
        $monthlyTotals = $this->findMonthlyTotals(month: $month);
        $series = $this->buildSeries(month: $month, monthlyTotals: $monthlyTotals);

        $current = $monthlyTotals[$month] ?? ['income' => 0.0, 'expense' => 0.0, 'count' => 0];
        $income = $current['income'];
        $expense = $current['expense'];

        $balance = $this->findBalanceAt(date: $today);
        $lastPoint = end($series);
        $previousPoint = count(value: $series) > 1 ? $series[count(value: $series) - 2] : $lastPoint;
        $balanceDelta = false === $lastPoint ? 0.0 : $lastPoint->endBalance - $previousPoint->endBalance;
        $balanceDeltaPercentage = 0.0 !== $previousPoint->endBalance
            ? round(num: $balanceDelta / abs(num: $previousPoint->endBalance) * 100, precision: 2)
            : 0.0;

        $previousMonth = $this->shiftMonth(month: $month, offset: -1);
        $previousExpense = $monthlyTotals[$previousMonth]['expense'] ?? 0.0;
        $expenseDeltaPercentage = $previousExpense > 0
            ? round(num: ($expense - $previousExpense) / $previousExpense * 100, precision: 2)
            : null;

        $averageExpense = $this->buildAverageExpense(month: $month, monthlyTotals: $monthlyTotals);
        $overspending = $averageExpense > 0 && $expense > $averageExpense * self::OVERSPENDING_THRESHOLD;
        $overspendingPercentage = $averageExpense > 0
            ? round(num: ($expense - $averageExpense) / $averageExpense * 100, precision: 2)
            : 0.0;

        $subscriptions = $this->findSubscriptions();
        $subscriptionsTotal = array_reduce(
            array: $subscriptions,
            callback: static fn (float $total, FinanceSubscription $subscription): float => $total + $subscription->amount,
            initial: 0.0,
        );

        return new GetFinanceOverviewResult(
            id: $month,
            aggregateName: 'FinanceOverview',
            month: $month,
            balance: round(num: $balance, precision: 2),
            balanceDelta: round(num: $balanceDelta, precision: 2),
            balanceDeltaPercentage: $balanceDeltaPercentage,
            income: round(num: $income, precision: 2),
            expense: round(num: $expense, precision: 2),
            net: round(num: $income - $expense, precision: 2),
            transactionCount: $current['count'],
            series: $series,
            byCategory: $this->findCategoryTotals(month: $month, expense: $expense),
            byStore: $this->findStoreTotals(month: $month),
            subscriptions: $subscriptions,
            subscriptionsTotal: round(num: $subscriptionsTotal, precision: 2),
            expenseDeltaPercentage: $expenseDeltaPercentage,
            overspending: $overspending,
            averageExpense: round(num: $averageExpense, precision: 2),
            overspendingPercentage: $overspendingPercentage,
        );
    }

    /**
     * @return array<string, array{income: float, expense: float, count: int}>
     */
    private function findMonthlyTotals(string $month): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'SUBSTRING(t.transaction_date, 1, 7) AS month',
                't.kind',
                'SUM(t.amount) AS total',
                'COUNT(t.id) AS movements',
            )
            ->from(table: 'finance_transaction', alias: 't')
            ->where('SUBSTRING(t.transaction_date, 1, 7) <= :month')
            ->setParameter(key: 'month', value: $month)
            ->groupBy('month', 't.kind')
            ->executeQuery()
            ->fetchAllAssociative();

        $totals = [];

        foreach ($rows as $row) {
            $key = (string) $row['month'];
            $totals[$key] ??= ['income' => 0.0, 'expense' => 0.0, 'count' => 0];
            $bucket = FinanceTransaction::KIND_INCOME === $row['kind'] ? 'income' : 'expense';
            $totals[$key][$bucket] += (float) $row['total'];
            $totals[$key]['count'] += (int) $row['movements'];
        }

        return $totals;
    }

    /**
     * @param array<string, array{income: float, expense: float, count: int}> $monthlyTotals
     *
     * @return array<int, FinanceMonthPoint>
     */
    private function buildSeries(string $month, array $monthlyTotals): array
    {
        $firstMonth = $this->shiftMonth(month: $month, offset: -(self::SERIES_MONTHS - 1));
        $carried = 0.0;

        foreach ($monthlyTotals as $key => $totals) {
            if ($key < $firstMonth) {
                $carried += $totals['income'] - $totals['expense'];
            }
        }

        $series = [];
        $balance = $carried;

        for ($offset = self::SERIES_MONTHS - 1; $offset >= 0; --$offset) {
            $key = $this->shiftMonth(month: $month, offset: -$offset);
            $totals = $monthlyTotals[$key] ?? ['income' => 0.0, 'expense' => 0.0, 'count' => 0];
            $balance += $totals['income'] - $totals['expense'];

            $series[] = new FinanceMonthPoint(
                month: $key,
                income: round(num: $totals['income'], precision: 2),
                expense: round(num: $totals['expense'], precision: 2),
                net: round(num: $totals['income'] - $totals['expense'], precision: 2),
                endBalance: round(num: $balance, precision: 2),
            );
        }

        return $series;
    }

    /**
     * @param array<string, array{income: float, expense: float, count: int}> $monthlyTotals
     */
    private function buildAverageExpense(string $month, array $monthlyTotals): float
    {
        $expenses = [];

        for ($offset = 1; $offset <= self::AVERAGE_MONTHS; ++$offset) {
            $key = $this->shiftMonth(month: $month, offset: -$offset);
            $expense = $monthlyTotals[$key]['expense'] ?? 0.0;

            if ($expense > 0) {
                $expenses[] = $expense;
            }
        }

        return [] === $expenses ? 0.0 : array_sum(array: $expenses) / count(value: $expenses);
    }

    private function findBalanceAt(string $date): float
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.kind', 'SUM(t.amount) AS total')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('t.transaction_date <= :date')
            ->setParameter(key: 'date', value: $date)
            ->groupBy('t.kind')
            ->executeQuery()
            ->fetchAllAssociative();

        $balance = 0.0;

        foreach ($rows as $row) {
            $total = (float) $row['total'];
            $balance += FinanceTransaction::KIND_INCOME === $row['kind'] ? $total : -$total;
        }

        return $balance;
    }

    /**
     * @return array<int, FinanceCategoryTotal>
     */
    private function findCategoryTotals(string $month, float $expense): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.category', 'SUM(t.amount) AS total')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('SUBSTRING(t.transaction_date, 1, 7) = :month')
            ->andWhere('t.kind = :kind')
            ->setParameter(key: 'month', value: $month)
            ->setParameter(key: 'kind', value: FinanceTransaction::KIND_EXPENSE)
            ->groupBy('t.category')
            ->orderBy('total', 'DESC')
            ->executeQuery()
            ->fetchAllAssociative();

        $totals = [];

        foreach ($rows as $row) {
            $amount = (float) $row['total'];

            $totals[] = new FinanceCategoryTotal(
                category: (string) $row['category'],
                amount: round(num: $amount, precision: 2),
                percentage: $expense > 0 ? round(num: $amount / $expense * 100, precision: 2) : 0.0,
            );
        }

        return $totals;
    }

    /**
     * @return array<int, FinanceStoreTotal>
     */
    private function findStoreTotals(string $month): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.store', 'SUM(t.amount) AS total')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('SUBSTRING(t.transaction_date, 1, 7) = :month')
            ->andWhere('t.kind = :kind')
            ->andWhere('t.store IS NOT NULL')
            ->setParameter(key: 'month', value: $month)
            ->setParameter(key: 'kind', value: FinanceTransaction::KIND_EXPENSE)
            ->groupBy('t.store')
            ->orderBy('total', 'DESC')
            ->setMaxResults(self::TOP_STORES)
            ->executeQuery()
            ->fetchAllAssociative();

        $totals = [];

        foreach ($rows as $row) {
            $totals[] = new FinanceStoreTotal(
                store: (string) $row['store'],
                amount: round(num: (float) $row['total'], precision: 2),
            );
        }

        return $totals;
    }

    /**
     * @return array<int, FinanceSubscription>
     */
    private function findSubscriptions(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.note', 't.amount', 't.category', 't.transaction_date')
            ->from(table: 'finance_transaction', alias: 't')
            ->where('t.recurring = :recurring')
            ->andWhere('t.kind = :kind')
            ->setParameter(key: 'recurring', value: true)
            ->setParameter(key: 'kind', value: FinanceTransaction::KIND_EXPENSE)
            ->orderBy('t.transaction_date', 'DESC')
            ->executeQuery()
            ->fetchAllAssociative();

        $subscriptions = [];

        foreach ($rows as $row) {
            $note = (string) $row['note'];

            if (array_key_exists(key: $note, array: $subscriptions)) {
                continue;
            }

            $subscriptions[$note] = new FinanceSubscription(
                note: $note,
                amount: round(num: (float) $row['amount'], precision: 2),
                category: (string) $row['category'],
                chargeDay: (int) substr(string: (string) $row['transaction_date'], offset: 8, length: 2),
            );
        }

        $subscriptions = array_values(array: $subscriptions);
        usort(
            array: $subscriptions,
            callback: static fn (FinanceSubscription $a, FinanceSubscription $b): int => $b->amount <=> $a->amount,
        );

        return $subscriptions;
    }

    private function shiftMonth(string $month, int $offset): string
    {
        return (new \DateTimeImmutable(datetime: $month.'-01'))
            ->modify(modifier: sprintf('%+d months', $offset))
            ->format(format: 'Y-m');
    }
}
