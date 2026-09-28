<?php

namespace Notification\Notification\Inbox\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetUnreadNotificationsCountQuery implements Query
{
    public function __construct(
        public string $userSessionId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.notification.query.1.notification.unread_count';
    }
}
