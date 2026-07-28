<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class MenuItemView
{
    public function __construct(
        public string $id,
        public ?string $dayKey,
        public string $meal,
        public string $kind,
        public string $refId,
        public string $name,
        public string $emoji,
        public float $quantity,
        public ?string $unit,
        public string $baseUnit,
        public int $position,
        public MacroBreakdown $macros,
    ) {
    }
}
