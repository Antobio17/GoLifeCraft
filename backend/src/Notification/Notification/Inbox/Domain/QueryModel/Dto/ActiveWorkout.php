<?php

namespace Notification\Notification\Inbox\Domain\QueryModel\Dto;

final readonly class ActiveWorkout
{
    public function __construct(
        public string $id,
        public ?string $sessionId,
        public string $sessionName,
        public \DateTimeImmutable $startedAt,
    ) {
    }
}
