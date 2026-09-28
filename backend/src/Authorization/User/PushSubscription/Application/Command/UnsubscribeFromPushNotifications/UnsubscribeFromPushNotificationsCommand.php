<?php

namespace Authorization\User\PushSubscription\Application\Command\UnsubscribeFromPushNotifications;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UnsubscribeFromPushNotificationsCommand implements Command
{
    public function __construct(
        public string $userSessionId,
        public string $endpoint,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.push_subscription.unsubscribe';
    }
}
