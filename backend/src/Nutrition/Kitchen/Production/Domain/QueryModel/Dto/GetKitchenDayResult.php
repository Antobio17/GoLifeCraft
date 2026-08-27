<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetKitchenDayResult extends QueryAggregateResult
{
    /**
     * @param KitchenDayToCookItem[]   $toCook
     * @param KitchenDayExpectedItem[] $expected
     * @param KitchenDayDoneItem[]     $done
     * @param KitchenDayWeekDay[]      $weekDays
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $date,
        public readonly array $toCook,
        public readonly array $expected,
        public readonly array $done,
        public readonly array $weekDays,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
