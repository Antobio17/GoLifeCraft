<?php

namespace Agenda\Agenda\Agenda\Domain\QueryModel\Dto;

final readonly class AgendaCalendarDay
{
    public function __construct(
        public string $date,
        public int $entryCount,
        public int $pendingCount,
    ) {
    }
}
