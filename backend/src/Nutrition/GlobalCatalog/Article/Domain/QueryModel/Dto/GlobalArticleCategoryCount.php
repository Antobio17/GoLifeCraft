<?php

namespace Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto;

final readonly class GlobalArticleCategoryCount
{
    public function __construct(
        public string $name,
        public int $count,
    ) {
    }
}
