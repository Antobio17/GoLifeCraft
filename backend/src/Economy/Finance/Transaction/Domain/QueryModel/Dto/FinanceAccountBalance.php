<?php

namespace Economy\Finance\Transaction\Domain\QueryModel\Dto;

final readonly class FinanceAccountBalance
{
    public function __construct(
        public string $accountId,
        public string $name,
        public string $type,
        public float $balance,
        public ?string $lastCheckDate,
    ) {
    }
}
