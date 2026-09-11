<?php

namespace Nutrition\Shopping\Ticket\Domain\Model;

final readonly class TicketLineDraft
{
    public function __construct(
        public TicketRawLine $rawLine,
        public ?TicketArticleLink $link,
        public ?string $linkSource = null,
    ) {
    }
}
