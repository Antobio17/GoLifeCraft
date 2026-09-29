<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Notification\Notification\Inbox\Domain\Model\Notification;
use Notification\Notification\Inbox\Domain\Model\NotificationRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineNotificationRepository extends EntityRepository implements NotificationRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Notification
    {
        return $this->find(id: $id);
    }

    public function save(Notification $notification): void
    {
        $this->getEntityManager()->persist(object: $notification);
    }
}
