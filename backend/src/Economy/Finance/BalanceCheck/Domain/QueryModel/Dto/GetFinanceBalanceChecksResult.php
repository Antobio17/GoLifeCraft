<?php

namespace Economy\Finance\BalanceCheck\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetFinanceBalanceChecksResult extends QueryAggregateResult
{
    /**
     * @param FinanceBalanceCheckView[] $checks
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly ?string $accountId,
        public readonly array $checks,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
