<?php

namespace Notification\Notification\PushSubscription\Application\Query\GetPushNotificationsConfig;

use Notification\Notification\PushSubscription\Domain\QueryModel\Dto\GetPushNotificationsConfigResult;
use Notification\Notification\PushSubscription\Domain\QueryModel\GetPushNotificationsConfigNeedleDataQuery;
use Shared\Push\Push\Domain\Service\PushNotificationSender;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetPushNotificationsConfigQueryHandler
{
    public function __construct(
        private GetPushNotificationsConfigNeedleDataQuery $needleDataQuery,
        private PushNotificationSender $pushNotificationSender,
        private GetPushNotificationsConfigDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetPushNotificationsConfigQuery $query): QueryResult
    {
        return $this->dataTransform->transform(config: new GetPushNotificationsConfigResult(
            id: $query->userSessionId,
            enabled: $this->pushNotificationSender->isConfigured(),
            vapidPublicKey: $this->pushNotificationSender->publicKey(),
            subscriptions: $this->needleDataQuery->countSubscriptionsOf(userId: $query->userSessionId),
        ));
    }
}
