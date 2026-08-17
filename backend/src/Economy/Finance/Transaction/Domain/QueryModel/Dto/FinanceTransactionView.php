<?php

namespace Economy\Finance\Transaction\Domain\QueryModel\Dto;

final readonly class FinanceTransactionView
{
    public function __construct(
        public string $id,
        public string $accountId,
        public string $accountName,
        public string $transactionDate,
        public string $kind,
        public float $amount,
        public string $category,
        public string $note,
        public ?string $store,
        public bool $recurring,
        public string $source,
    ) {
    }
}
