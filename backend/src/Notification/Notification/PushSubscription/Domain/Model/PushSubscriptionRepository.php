<?php

namespace Notification\Notification\PushSubscription\Domain\Model;

interface PushSubscriptionRepository
{
    public function nextId(): string;

    public function findByEndpoint(string $endpoint): ?PushSubscription;

    /**
     * @return PushSubscription[]
     */
    public function findByUserId(string $userId): array;

    public function save(PushSubscription $pushSubscription): void;

    public function remove(PushSubscription $pushSubscription): void;
}
