<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class DiaryQuickEntryView
{
    public function __construct(
        public string $name,
        public string $emoji,
        public MacroBreakdown $perUnit,
    ) {
    }
}
