<?php

namespace Shared\Shared\DomainEventLog\Infrastructure\Domain\Model\InMemory;

use Shared\Shared\DomainEventLog\Domain\Model\DomainEventLog;
use Shared\Shared\DomainEventLog\Domain\Model\DomainEventLogRepository;

final class InMemoryDomainEventLogRepository implements DomainEventLogRepository
{
    /** @var DomainEventLog[] */
    private array $logs = [];

    public function nextId(): string
    {
        return (string) (count(value: $this->logs) + 1);
    }

    public function save(DomainEventLog $domainEventLog): void
    {
        $this->logs[] = $domainEventLog;
    }

    /** @return DomainEventLog[] */
    public function findAll(): array
    {
        return $this->logs;
    }
}
