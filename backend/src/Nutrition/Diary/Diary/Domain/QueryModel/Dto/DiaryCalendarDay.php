<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

final readonly class DiaryCalendarDay
{
    public const STATUS_GREEN = 'green';
    public const STATUS_ORANGE = 'orange';
    public const STATUS_RED = 'red';
    public const STATUS_REST = 'rest';

    public function __construct(
        public string $date,
        public string $status,
        public int $percent,
        public int $entryCount,
    ) {
    }
}
