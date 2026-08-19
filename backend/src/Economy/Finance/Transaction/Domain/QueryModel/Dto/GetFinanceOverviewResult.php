<?php

namespace Economy\Finance\Transaction\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetFinanceOverviewResult extends QueryAggregateResult
{
    /**
     * @param FinanceMonthPoint[]     $series
     * @param FinanceCategoryTotal[]  $byCategory
     * @param FinanceStoreTotal[]     $byStore
     * @param FinanceAccountBalance[] $accounts
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $month,
        public readonly float $balance,
        public readonly array $accounts,
        public readonly float $balanceDelta,
        public readonly float $balanceDeltaPercentage,
        public readonly float $income,
        public readonly float $expense,
        public readonly float $net,
        public readonly int $transactionCount,
        public readonly array $series,
        public readonly array $byCategory,
        public readonly array $byStore,
        public readonly ?float $expenseDeltaPercentage,
        public readonly bool $overspending,
        public readonly float $averageExpense,
        public readonly float $overspendingPercentage,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
