<?php

namespace Gym\Training\Session\Domain\QueryModel\Dto;

final readonly class ProgressionView
{
    /**
     * @param int[] $repTargets
     */
    public function __construct(
        public string $mode,
        public array $repTargets,
        public int $repTolerance,
        public ?float $incrementKg,
    ) {
    }
}
