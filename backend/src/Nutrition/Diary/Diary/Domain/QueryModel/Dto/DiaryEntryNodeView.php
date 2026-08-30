<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class DiaryEntryNodeView
{
    /**
     * @param DiaryEntryNodeView[] $children
     */
    public function __construct(
        public string $path,
        public string $kind,
        public string $refId,
        public string $name,
        public string $emoji,
        public float $quantity,
        public string $unit,
        public MacroBreakdown $macros,
        public array $children,
        public ?DiaryEntryLotView $lot = null,
    ) {
    }
}
