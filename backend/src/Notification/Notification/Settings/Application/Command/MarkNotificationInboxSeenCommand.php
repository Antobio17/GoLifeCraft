<?php

namespace Notification\Notification\Settings\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class MarkNotificationInboxSeenCommand implements Command
{
    public function __construct(
        public string $seenByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.notification.command.1.notification_settings.mark_inbox_seen';
    }
}
