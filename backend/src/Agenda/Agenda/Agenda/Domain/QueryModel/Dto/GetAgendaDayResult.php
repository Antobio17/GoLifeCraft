<?php

namespace Agenda\Agenda\Agenda\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetAgendaDayResult extends QueryAggregateResult
{
    /**
     * @param AgendaEntryView[] $entries
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $date,
        public readonly array $entries,
        public readonly int $entryCount,
        public readonly int $pendingCount,
        public readonly int $doneCount,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
