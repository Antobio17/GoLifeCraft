<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProductionItemView
{
    /**
     * @param string[] $requiredBy
     */
    public function __construct(
        public string $itemId,
        public string $recipeId,
        public string $name,
        public string $emoji,
        public string $status,
        public float $servingsPlanned,
        public float $servingsCooked,
        public array $requiredBy = [],
    ) {
    }
}
