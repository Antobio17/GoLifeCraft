<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

final readonly class GetArticleFacetsResult
{
    /**
     * @param string[] $categories
     * @param string[] $brands
     * @param string[] $stores
     */
    public function __construct(
        public array $categories,
        public array $brands,
        public array $stores,
    ) {
    }
}
