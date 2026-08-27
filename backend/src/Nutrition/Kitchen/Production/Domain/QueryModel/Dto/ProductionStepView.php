<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProductionStepView
{
    public function __construct(
        public int $position,
        public string $text,
        public ?int $minutes,
    ) {
    }
}
