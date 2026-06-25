<?php

namespace Shared\Shared\DomainEventLog\Domain\Model;

interface DomainEventLogRepository
{
    public function nextId(): string;

    public function save(DomainEventLog $domainEventLog): void;
}
