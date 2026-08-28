<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class DiaryEntryView
{
    /**
     * @param DiaryEntryNodeView[] $tree
     */
    public function __construct(
        public string $id,
        public string $kind,
        public ?string $refId,
        public string $name,
        public string $emoji,
        public float $quantity,
        public string $unit,
        public MacroBreakdown $macros,
        public ?DiaryQuickEntryView $quick = null,
        public bool $customized = false,
        public array $tree = [],
        public bool $consumed = false,
        public string $stockState = 'none',
    ) {
    }
}
