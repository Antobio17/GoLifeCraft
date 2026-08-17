<?php

namespace Economy\Finance\Account\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetFinanceAccountsResult extends QueryAggregateResult
{
    /**
     * @param FinanceAccountView[] $accounts
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $date,
        public readonly array $accounts,
        public readonly float $balance,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
