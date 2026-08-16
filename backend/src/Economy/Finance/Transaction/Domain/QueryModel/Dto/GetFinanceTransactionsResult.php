<?php

namespace Economy\Finance\Transaction\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetFinanceTransactionsResult extends QueryAggregateResult
{
    /**
     * @param FinanceTransactionView[] $transactions
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $month,
        public readonly ?string $date,
        public readonly array $transactions,
        public readonly int $transactionCount,
        public readonly float $income,
        public readonly float $expense,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
