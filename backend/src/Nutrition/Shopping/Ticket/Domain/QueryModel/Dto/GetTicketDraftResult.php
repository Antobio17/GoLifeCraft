<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel\Dto;

final readonly class GetTicketDraftResult
{
    /**
     * @param string[] $lowConfidenceFields
     * @param string[] $notes
     */
    public function __construct(
        public ?TicketDraft $draft,
        public bool $fromCache,
        public array $lowConfidenceFields,
        public array $notes,
    ) {
    }
}
