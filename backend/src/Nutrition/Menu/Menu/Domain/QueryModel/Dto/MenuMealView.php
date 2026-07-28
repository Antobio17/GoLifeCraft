<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class MenuMealView
{
    /**
     * @param MenuItemView[] $items
     */
    public function __construct(
        public string $key,
        public array $items,
        public int $itemCount,
        public MacroBreakdown $totals,
    ) {
    }
}
