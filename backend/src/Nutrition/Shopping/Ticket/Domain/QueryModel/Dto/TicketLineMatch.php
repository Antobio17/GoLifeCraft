<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel\Dto;

final readonly class TicketLineMatch
{
    public function __construct(
        public string $articleId,
        public float $score,
    ) {
    }
}
