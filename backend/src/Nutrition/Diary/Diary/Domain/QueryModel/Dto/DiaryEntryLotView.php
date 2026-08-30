<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

final readonly class DiaryEntryLotView
{
    public function __construct(
        public string $productionItemId,
        public ?string $code,
        public string $label,
        public string $cookedOn,
        public bool $customized,
    ) {
    }
}
