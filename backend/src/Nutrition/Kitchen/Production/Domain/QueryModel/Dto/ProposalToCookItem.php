<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProposalToCookItem
{
    /**
     * @param string[] $requiredBy
     */
    public function __construct(
        public string $recipeId,
        public string $name,
        public string $emoji,
        public ?string $image,
        public string $prepMode,
        public ?string $dueDate,
        public float $demand,
        public float $inStock,
        public float $inProduction,
        public float $deficit,
        public array $requiredBy,
        public ?ProposalPackHint $packHint = null,
    ) {
    }
}
