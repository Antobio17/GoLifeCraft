<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel\Dto;

final readonly class TicketDraftExtraction
{
    /**
     * @param string[] $lowConfidenceFields
     * @param string[] $notes
     */
    private function __construct(
        public ?TicketDraft $draft,
        public array $lowConfidenceFields,
        public array $notes,
    ) {
    }

    /**
     * @param string[] $lowConfidenceFields
     * @param string[] $notes
     */
    public static function success(TicketDraft $draft, array $lowConfidenceFields, array $notes): self
    {
        return new self(draft: $draft, lowConfidenceFields: $lowConfidenceFields, notes: $notes);
    }

    /**
     * @param string[] $notes
     */
    public static function failure(array $notes): self
    {
        return new self(draft: null, lowConfidenceFields: [], notes: $notes);
    }

    public function isSuccessful(): bool
    {
        return null !== $this->draft;
    }
}
