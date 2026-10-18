<?php

namespace Nutrition\Diary\Diary\Application\Query;

use Nutrition\Diary\Diary\Domain\QueryModel\ConsumePastDiaryEntriesNeedleDataQuery;

final readonly class GetPastPendingDiaryEntryIdsQueryHandler
{
    public function __construct(
        private ConsumePastDiaryEntriesNeedleDataQuery $needleDataQuery,
    ) {
    }

    /**
     * @return string[]
     */
    public function __invoke(GetPastPendingDiaryEntryIdsQuery $query): array
    {
        return $this->needleDataQuery->findPendingEntryIds(fromDate: $query->fromDate, toDate: $query->toDate);
    }
}
