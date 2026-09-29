<?php

namespace Notification\Notification\Inbox\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DismissNotificationCommand implements Command
{
    public function __construct(
        public string $notificationId,
        public string $dismissedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.notification.command.1.notification.dismiss';
    }
}
