<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

use Nutrition\Catalog\Article\Domain\Model\ArticleDraftSource;

final readonly class GetArticleDraftResult
{
    /**
     * @param string[] $lowConfidenceFields
     * @param string[] $notes
     */
    public function __construct(
        public ArticleDraftSource $source,
        public ?string $barcode,
        public ?string $globalArticleId,
        public ?ArticleDraft $draft,
        public array $lowConfidenceFields,
        public array $notes,
    ) {
    }
}
