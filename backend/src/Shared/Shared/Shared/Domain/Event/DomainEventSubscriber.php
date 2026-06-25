<?php

namespace Shared\Shared\Shared\Domain\Event;

interface DomainEventSubscriber
{
    public function __invoke(DomainEvent $event): void;
}
