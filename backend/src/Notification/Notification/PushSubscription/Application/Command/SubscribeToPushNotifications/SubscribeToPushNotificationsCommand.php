<?php

namespace Notification\Notification\PushSubscription\Application\Command\SubscribeToPushNotifications;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class SubscribeToPushNotificationsCommand implements Command
{
    public function __construct(
        public string $userSessionId,
        public string $endpoint,
        public string $publicKey,
        public string $authToken,
        public string $contentEncoding,
        public ?string $userAgent,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.notification.command.1.push_subscription.subscribe';
    }
}
