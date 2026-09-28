<?php

namespace Authorization\User\PushSubscription\Infrastructure\Domain\Model\Doctrine;

use Authorization\User\PushSubscription\Domain\Model\PushSubscription;
use Authorization\User\PushSubscription\Domain\Model\PushSubscriptionRepository;
use Doctrine\ORM\EntityRepository;
use Ramsey\Uuid\Uuid;

final class DoctrinePushSubscriptionRepository extends EntityRepository implements PushSubscriptionRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByEndpoint(string $endpoint): ?PushSubscription
    {
        return $this->findOneBy(criteria: ['endpointHash' => PushSubscription::hashEndpoint(endpoint: $endpoint)]);
    }

    public function findByUserId(string $userId): array
    {
        return $this->findBy(criteria: ['userId' => $userId], orderBy: ['createdAt' => 'ASC']);
    }

    public function save(PushSubscription $pushSubscription): void
    {
        $this->getEntityManager()->persist(object: $pushSubscription);
        $this->getEntityManager()->flush();
    }

    public function remove(PushSubscription $pushSubscription): void
    {
        $this->getEntityManager()->remove(object: $pushSubscription);
        $this->getEntityManager()->flush();
    }
}
