<?php

namespace Agenda\Agenda\Agenda\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetAgendaEntrySeriesResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $seriesId,
        public readonly string $entryDate,
        public readonly string $endDate,
        public readonly string $title,
        public readonly string $kind,
        public readonly string $category,
        public readonly string $notes,
        public readonly int $entryCount,
        public readonly int $pendingCount,
        public readonly int $doneCount,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
