<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetMenusResult extends QueryAggregateResult
{
    /**
     * @param array<int, string> $weekDays
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $name,
        public readonly string $emoji,
        public readonly string $note,
        public readonly string $type,
        public readonly array $weekDays,
        public readonly int $dayCount,
        public readonly int $itemCount,
        public readonly MacroBreakdown $total,
        public readonly MacroBreakdown $perDay,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
