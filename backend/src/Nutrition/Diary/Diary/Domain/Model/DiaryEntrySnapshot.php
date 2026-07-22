<?php

namespace Nutrition\Diary\Diary\Domain\Model;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class DiaryEntrySnapshot
{
    public function __construct(
        public string $name,
        public string $emoji,
        public MacroBreakdown $macros,
    ) {
    }
}
