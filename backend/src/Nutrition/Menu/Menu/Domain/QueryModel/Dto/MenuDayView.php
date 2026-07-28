<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class MenuDayView
{
    /**
     * @param MenuMealView[] $meals
     */
    public function __construct(
        public ?string $dayKey,
        public array $meals,
        public int $itemCount,
        public MacroBreakdown $totals,
    ) {
    }
}
