<?php

namespace Shared\Shared\DomainEventLog\Domain\Model;

class DomainEventLog
{
    private int $version;

    public function __construct(
        public readonly string $id,
        public readonly string $eventName,
        public readonly string $aggregateId,
        public readonly string $payload,
        public readonly \DateTime $occurredOn,
        public readonly \DateTime $recordedAt,
    ) {
    }
}
