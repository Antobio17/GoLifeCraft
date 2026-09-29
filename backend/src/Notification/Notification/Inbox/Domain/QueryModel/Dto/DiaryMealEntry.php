<?php

namespace Notification\Notification\Inbox\Domain\QueryModel\Dto;

final readonly class DiaryMealEntry
{
    public function __construct(
        public string $meal,
        public string $name,
        public string $emoji,
    ) {
    }
}
