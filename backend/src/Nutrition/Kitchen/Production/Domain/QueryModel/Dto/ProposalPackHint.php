<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProposalPackHint
{
    public function __construct(
        public string $articleId,
        public string $articleName,
        public string $packUnit,
        public float $packQuantity,
        public string $unit,
        public float $neededQuantity,
        public float $suggestedServings,
    ) {
    }
}
