<?php

namespace Notification\Notification\PushSubscription\Application\Command\SendPushNotification;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class SendPushNotificationCommand implements Command
{
    public function __construct(
        public string $userId,
        public string $title,
        public string $body,
        public ?string $url = null,
        public ?string $tag = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.notification.command.1.push_subscription.send_notification';
    }
}
