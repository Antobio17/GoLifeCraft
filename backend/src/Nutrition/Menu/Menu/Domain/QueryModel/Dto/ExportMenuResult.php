<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class ExportMenuResult extends QueryAggregateResult
{
    /**
     * @param MenuExportDayView[] $days
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $name,
        public readonly string $emoji,
        public readonly string $note,
        public readonly string $type,
        public readonly array $days,
        public readonly int $itemCount,
        public readonly int $plannedDayCount,
        public readonly MacroBreakdown $total,
        public readonly MacroBreakdown $perDay,
        public readonly \DateTime $generatedAt,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
