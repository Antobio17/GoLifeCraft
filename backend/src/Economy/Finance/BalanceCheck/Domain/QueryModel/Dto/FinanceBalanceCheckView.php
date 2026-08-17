<?php

namespace Economy\Finance\BalanceCheck\Domain\QueryModel\Dto;

final readonly class FinanceBalanceCheckView
{
    public function __construct(
        public string $id,
        public string $accountId,
        public string $accountName,
        public string $checkDate,
        public float $amount,
        public string $note,
        public float $expectedAmount,
        public float $drift,
    ) {
    }
}
