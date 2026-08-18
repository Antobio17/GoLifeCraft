<?php

namespace Economy\Finance\Recurrence\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetFinanceRecurrencesResult extends QueryAggregateResult
{
    /**
     * @param FinanceRecurrenceView[] $recurrences
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly ?string $accountId,
        public readonly array $recurrences,
        public readonly float $monthlyIncome,
        public readonly float $monthlyExpense,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
