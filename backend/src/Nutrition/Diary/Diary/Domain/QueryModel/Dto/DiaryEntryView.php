<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class DiaryEntryView
{
    public const string STOCK_NONE = 'none';

    public const string STOCK_COVERED = 'covered';

    public const string STOCK_SHORT = 'short';

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
        public string $stockState = self::STOCK_NONE,
    ) {
    }
}
