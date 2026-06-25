<?php

namespace Shared\Shared\DomainEventLog\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Ramsey\Uuid\Uuid;
use Shared\Shared\DomainEventLog\Domain\Model\DomainEventLog;
use Shared\Shared\DomainEventLog\Domain\Model\DomainEventLogRepository;

final class DoctrineDomainEventLogRepository extends EntityRepository implements DomainEventLogRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function save(DomainEventLog $domainEventLog): void
    {
        $this->getEntityManager()->persist(object: $domainEventLog);
    }
}
