<?php

namespace Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto;

final readonly class GetGlobalArticleFacetsResult
{
    /**
     * @param GlobalArticleCategoryCount[] $categories
     */
    public function __construct(
        public array $categories,
    ) {
    }
}
