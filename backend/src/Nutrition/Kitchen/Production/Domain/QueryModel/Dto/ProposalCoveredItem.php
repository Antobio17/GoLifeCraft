<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProposalCoveredItem
{
    public function __construct(
        public string $recipeId,
        public string $name,
        public string $emoji,
        public ?string $image,
        public float $demand,
        public float $inStock,
        public float $inProduction,
    ) {
    }
}
