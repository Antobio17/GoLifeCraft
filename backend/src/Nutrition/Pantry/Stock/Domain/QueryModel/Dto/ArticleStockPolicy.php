<?php

namespace Nutrition\Pantry\Stock\Domain\QueryModel\Dto;

final readonly class ArticleStockPolicy
{
    public function __construct(
        public string $articleId,
        public ?string $packUnit,
        public ?float $packSize,
    ) {
    }
}
