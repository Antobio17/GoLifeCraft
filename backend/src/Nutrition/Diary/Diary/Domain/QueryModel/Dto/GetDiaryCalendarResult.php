<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetDiaryCalendarResult extends QueryAggregateResult
{
    /**
     * @param DiaryCalendarDay[] $days
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $month,
        public readonly array $days,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
