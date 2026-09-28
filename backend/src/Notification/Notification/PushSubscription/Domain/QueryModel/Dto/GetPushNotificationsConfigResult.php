<?php

namespace Notification\Notification\PushSubscription\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetPushNotificationsConfigResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        public readonly bool $enabled,
        public readonly ?string $vapidPublicKey,
        public readonly int $subscriptions,
    ) {
        parent::__construct(id: $id, aggregateName: 'PushNotificationsConfig');
    }
}
