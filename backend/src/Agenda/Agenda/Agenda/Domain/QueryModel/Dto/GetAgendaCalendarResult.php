<?php

namespace Agenda\Agenda\Agenda\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetAgendaCalendarResult extends QueryAggregateResult
{
    /**
     * @param AgendaCalendarDay[] $days
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
