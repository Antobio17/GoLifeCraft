<?php

namespace Agenda\Agenda\Agenda\Domain\QueryModel\Dto;

final readonly class AgendaEntryView
{
    public function __construct(
        public string $id,
        public string $entryDate,
        public ?string $time,
        public string $title,
        public string $kind,
        public string $category,
        public string $notes,
        public bool $done,
    ) {
    }
}
