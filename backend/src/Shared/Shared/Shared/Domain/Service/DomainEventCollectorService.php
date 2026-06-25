<?php

namespace Shared\Shared\Shared\Domain\Service;

use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Model\Aggregate;

final class DomainEventCollectorService
{
    /** @var Aggregate[] */
    private array $aggregates = [];

    public function register(Aggregate $aggregate): void
    {
        $this->aggregates[] = $aggregate;
    }

    /** @return DomainEvent[] */
    public function pullEvents(): array
    {
        $events = [];
        foreach ($this->aggregates as $aggregate) {
            $events = array_merge($events, $aggregate->pullDomainEvents());
        }

        $this->aggregates = [];

        return $events;
    }

    public function reset(): void
    {
        $this->aggregates = [];
    }
}
