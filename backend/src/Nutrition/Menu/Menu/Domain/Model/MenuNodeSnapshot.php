<?php

namespace Nutrition\Menu\Menu\Domain\Model;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class MenuNodeSnapshot
{
    public function __construct(
        public string $name,
        public string $emoji,
        public MacroBreakdown $macros,
    ) {
    }
}
