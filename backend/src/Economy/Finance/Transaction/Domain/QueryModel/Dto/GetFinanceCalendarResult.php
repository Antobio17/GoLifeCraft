<?php

namespace Economy\Finance\Transaction\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetFinanceCalendarResult extends QueryAggregateResult
{
    /**
     * @param FinanceCalendarDay[] $days
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $month,
        public readonly array $days,
        public readonly float $expense,
        public readonly float $income,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
