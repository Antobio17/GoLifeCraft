<?php

namespace Economy\Finance\Transaction\Domain\QueryModel\Dto;

final readonly class FinanceStoreTotal
{
    public function __construct(
        public string $store,
        public float $amount,
    ) {
    }
}
