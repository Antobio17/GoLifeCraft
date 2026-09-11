<?php

namespace Nutrition\Shopping\Ticket\Domain\Model;

final readonly class TicketArticleLink
{
    public function __construct(
        public string $articleId,
        public string $name,
        public ?string $emoji,
        public ?string $packUnit,
        public ?float $packSize,
        public string $baseUnit,
    ) {
    }
}
