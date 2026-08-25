<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

final readonly class ArticleDraftExtraction
{
    /**
     * @param string[] $lowConfidenceFields
     * @param string[] $notes
     */
    private function __construct(
        public ?ArticleDraft $draft,
        public array $lowConfidenceFields,
        public array $notes,
    ) {
    }

    /**
     * @param string[] $lowConfidenceFields
     * @param string[] $notes
     */
    public static function success(ArticleDraft $draft, array $lowConfidenceFields, array $notes): self
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
