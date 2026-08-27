<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class KitchenDayWeekDay
{
    public function __construct(
        public string $date,
        public bool $hasItems,
    ) {
    }
}
