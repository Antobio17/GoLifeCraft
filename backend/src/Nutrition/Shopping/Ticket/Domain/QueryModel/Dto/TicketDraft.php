<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel\Dto;

final readonly class TicketDraft
{
    /**
     * @param TicketDraftLine[] $lines
     */
    public function __construct(
        public ?string $storeName,
        public ?string $supermarketId,
        public ?string $purchasedOn,
        public ?float $total,
        public array $lines,
    ) {
    }
}
