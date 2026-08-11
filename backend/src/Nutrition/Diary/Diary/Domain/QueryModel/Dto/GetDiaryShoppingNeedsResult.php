<?php

namespace Nutrition\Diary\Diary\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetDiaryShoppingNeedsResult extends QueryAggregateResult
{
    /**
     * @param DiaryShoppingNeedView[] $needs
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $fromDate,
        public readonly string $toDate,
        public readonly int $dayCount,
        public readonly int $entryCount,
        public readonly array $needs,
        public readonly int $needCount,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
