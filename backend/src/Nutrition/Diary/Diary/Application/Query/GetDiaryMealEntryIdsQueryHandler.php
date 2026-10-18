<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Nutrition\Diary\Diary\Domain\QueryModel\ConsumeDiaryMealNeedleDataQuery;

final readonly class GetDiaryMealEntryIdsQueryHandler
{
    public function __construct(
        private ConsumeDiaryMealNeedleDataQuery $needleDataQuery,
    ) {
    }

    /**
     * @return string[]
     */
    public function __invoke(GetDiaryMealEntryIdsQuery $query): array
    {
        return $this->needleDataQuery->findEntryIds(date: $query->date, meal: $query->meal);
    }
}
