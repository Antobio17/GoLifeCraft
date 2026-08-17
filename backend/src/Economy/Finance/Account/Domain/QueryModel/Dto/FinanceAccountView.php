<?php

namespace Economy\Finance\Account\Domain\QueryModel\Dto;

final readonly class FinanceAccountView
{
    public function __construct(
        public string $id,
        public string $name,
        public string $type,
        public float $balance,
        public ?string $lastCheckDate,
        public ?float $lastCheckAmount,
        public int $transactionCount,
    ) {
    }
}
