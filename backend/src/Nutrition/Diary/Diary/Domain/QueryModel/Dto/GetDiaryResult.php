<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetDiaryResult extends QueryAggregateResult
{
    /**
     * @param DiaryMealView[] $meals
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $date,
        public readonly DiaryGoals $goals,
        public readonly MacroBreakdown $totals,
        public readonly int $entryCount,
        public readonly int $consumedCalories,
        public readonly int $goalCalories,
        public readonly int $remainingCalories,
        public readonly int $percent,
        public readonly array $meals,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
