<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class DiaryMealView
{
    /**
     * @param DiaryEntryView[] $entries
     */
    public function __construct(
        public string $key,
        public int $entryCount,
        public MacroBreakdown $totals,
        public array $entries,
    ) {
    }
}
