<?php

namespace Shared\Shared\Shared\Domain\Event;

abstract readonly class DomainEvent
{
    public function __construct(
        public string $aggregateId,
        public \DateTime $occurredOn,
    ) {
    }

    abstract public function getName(): string;
}
