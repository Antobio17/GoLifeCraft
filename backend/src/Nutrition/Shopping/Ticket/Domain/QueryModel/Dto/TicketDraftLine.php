<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel\Dto;

final readonly class TicketDraftLine
{
    public function __construct(
        public string $rawName,
        public float $quantity,
        public ?string $rawUnit,
        public ?float $unitPrice,
        public ?float $totalPrice,
    ) {
    }
}
