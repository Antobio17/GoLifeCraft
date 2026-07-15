<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class DiaryEntryView
{
    public function __construct(
        public string $id,
        public string $kind,
        public string $refId,
        public string $name,
        public string $emoji,
        public float $quantity,
        public string $unit,
        public MacroBreakdown $macros,
    ) {
    }
}
