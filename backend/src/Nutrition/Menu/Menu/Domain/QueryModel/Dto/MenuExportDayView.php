<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class MenuExportDayView
{
    /**
     * @param MenuExportMealView[] $meals
     */
    public function __construct(
        public ?string $dayKey,
        public array $meals,
        public int $itemCount,
        public MacroBreakdown $totals,
    ) {
    }
}
