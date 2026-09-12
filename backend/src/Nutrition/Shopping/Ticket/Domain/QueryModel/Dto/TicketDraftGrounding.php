<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel\Dto;

final readonly class TicketDraftGrounding
{
    /**
     * @param array<string, string> $supermarkets id => name
     */
    public function __construct(
        public array $supermarkets,
    ) {
    }

    /**
     * @return string[]
     */
    public function supermarketIds(): array
    {
        return array_keys($this->supermarkets);
    }
}
