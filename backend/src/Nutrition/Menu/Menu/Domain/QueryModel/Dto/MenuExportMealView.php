<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class MenuExportMealView
{
    /**
     * @param MenuExportItemView[] $items
     */
    public function __construct(
        public string $key,
        public array $items,
        public MacroBreakdown $totals,
    ) {
    }
}
