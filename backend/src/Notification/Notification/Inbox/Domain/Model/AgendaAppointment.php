<?php

namespace Notification\Notification\Inbox\Domain\Model;

final readonly class AgendaAppointment
{
    public function __construct(
        public string $id,
        public string $entryDate,
        public ?string $time,
        public string $title,
        public \DateTimeImmutable $createdAt,
    ) {
    }
}
