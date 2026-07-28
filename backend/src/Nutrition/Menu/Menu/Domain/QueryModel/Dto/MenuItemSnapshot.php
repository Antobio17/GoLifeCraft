<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

final readonly class MenuItemSnapshot
{
    public function __construct(
        public ?string $dayKey,
        public string $meal,
        public string $kind,
        public string $refId,
        public float $quantity,
        public ?string $unit,
        public int $position,
    ) {
    }
}
