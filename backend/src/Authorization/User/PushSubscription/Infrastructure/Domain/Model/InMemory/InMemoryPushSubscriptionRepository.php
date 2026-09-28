<?php

namespace Authorization\User\PushSubscription\Infrastructure\Domain\Model\InMemory;

use Authorization\User\PushSubscription\Domain\Model\PushSubscription;
use Authorization\User\PushSubscription\Domain\Model\PushSubscriptionRepository;

final class InMemoryPushSubscriptionRepository implements PushSubscriptionRepository
{
    /** @var array<string, PushSubscription> */
    private array $pushSubscriptions = [];

    private int $sequence = 0;

    public function nextId(): string
    {
        return 'push-subscription-'.++$this->sequence;
    }

    public function findByEndpoint(string $endpoint): ?PushSubscription
    {
        $endpointHash = PushSubscription::hashEndpoint(endpoint: $endpoint);

        foreach ($this->pushSubscriptions as $pushSubscription) {
            if ($pushSubscription->endpointHash === $endpointHash) {
                return $pushSubscription;
            }
        }

        return null;
    }

    public function findByUserId(string $userId): array
    {
        return array_values(array: array_filter(
            array: $this->pushSubscriptions,
            callback: static fn (PushSubscription $pushSubscription): bool => $pushSubscription->belongsTo(userId: $userId),
        ));
    }

    public function save(PushSubscription $pushSubscription): void
    {
        $this->pushSubscriptions[$pushSubscription->id] = $pushSubscription;
    }

    public function remove(PushSubscription $pushSubscription): void
    {
        unset($this->pushSubscriptions[$pushSubscription->id]);
    }

    /** @return PushSubscription[] */
    public function all(): array
    {
        return array_values(array: $this->pushSubscriptions);
    }
}
