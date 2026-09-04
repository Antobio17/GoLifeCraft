<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class MenuItemNodeView
{
    /**
     * @param MenuItemNodeView[] $children
     */
    public function __construct(
        public string $path,
        public string $kind,
        public string $refId,
        public string $name,
        public string $emoji,
        public ?string $image,
        public float $quantity,
        public string $unit,
        public MacroBreakdown $macros,
        public array $children,
    ) {
    }
}
