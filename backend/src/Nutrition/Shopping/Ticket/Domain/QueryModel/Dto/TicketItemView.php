<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel\Dto;

final readonly class TicketItemView
{
    public function __construct(
        public string $id,
        public int $position,
        public string $rawName,
        public float $quantity,
        public ?string $rawUnit,
        public ?float $unitPrice,
        public ?float $totalPrice,
        public ?string $articleId,
        public ?string $articleName,
        public ?string $articleEmoji,
        public ?string $articleImage,
        public ?float $articlePrice,
        public ?string $linkSource,
        public ?string $packUnit,
        public ?float $packSize,
        public ?string $baseUnit,
        public ?float $baseQuantity,
        public bool $received,
    ) {
    }
}
