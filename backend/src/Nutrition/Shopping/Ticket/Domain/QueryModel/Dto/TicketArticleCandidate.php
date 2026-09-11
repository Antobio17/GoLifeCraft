<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel\Dto;

use Nutrition\Shopping\Ticket\Domain\Model\TicketArticleLink;

final readonly class TicketArticleCandidate
{
    public function __construct(
        public string $articleId,
        public string $name,
        public ?string $brand,
        public ?string $emoji,
        public ?string $packUnit,
        public ?float $packSize,
        public string $baseUnit,
    ) {
    }

    public function toLink(): TicketArticleLink
    {
        return new TicketArticleLink(
            articleId: $this->articleId,
            name: $this->name,
            emoji: $this->emoji,
            packUnit: $this->packUnit,
            packSize: $this->packSize,
            baseUnit: $this->baseUnit,
        );
    }

    public function searchableText(): string
    {
        return null === $this->brand ? $this->name : $this->name.' '.$this->brand;
    }
}
