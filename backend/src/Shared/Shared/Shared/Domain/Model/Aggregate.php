<?php

namespace Shared\Shared\Shared\Domain\Model;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

abstract class Aggregate
{
    private array $domainEvents = [];

    public function __construct()
    {
    }

    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];

        return $events;
    }

    public function record(DomainEvent $event): void
    {
        $this->domainEvents[] = $event;
    }
}
