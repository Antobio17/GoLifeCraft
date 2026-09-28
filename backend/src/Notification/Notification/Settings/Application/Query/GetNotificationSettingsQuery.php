<?php

namespace Notification\Notification\Settings\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetNotificationSettingsQuery implements Query
{
    public static function getName(): string
    {
        return 'golifecraft.notification.query.1.notification_settings.get';
    }
}
