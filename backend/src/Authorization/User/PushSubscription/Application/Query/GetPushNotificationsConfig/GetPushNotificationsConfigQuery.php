<?php

namespace Authorization\User\PushSubscription\Application\Query\GetPushNotificationsConfig;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetPushNotificationsConfigQuery implements Query
{
    public function __construct(
        public string $userSessionId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.query.1.push_subscription.get_config';
    }
}
