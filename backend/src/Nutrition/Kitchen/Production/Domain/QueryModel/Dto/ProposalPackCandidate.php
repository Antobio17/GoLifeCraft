<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProposalPackCandidate
{
    public function __construct(
        public ProductionIngredient $ingredient,
        public string $packUnit,
        public float $packQuantity,
        public float $uplift,
    ) {
    }
}
