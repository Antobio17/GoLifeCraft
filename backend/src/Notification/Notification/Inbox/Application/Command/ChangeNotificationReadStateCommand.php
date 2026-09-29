<?php

namespace Notification\Notification\Inbox\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ChangeNotificationReadStateCommand implements Command
{
    public function __construct(
        public string $notificationId,
        public bool $read,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.notification.command.1.notification.change_read_state';
    }
}
