<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class MenuExportItemView
{
    /**
     * @param MenuItemNodeView[] $tree
     */
    public function __construct(
        public string $kind,
        public string $refId,
        public string $name,
        public string $emoji,
        public float $quantity,
        public string $unit,
        public ?int $servings,
        public bool $customized,
        public array $tree,
        public MacroBreakdown $macros,
    ) {
    }
}
