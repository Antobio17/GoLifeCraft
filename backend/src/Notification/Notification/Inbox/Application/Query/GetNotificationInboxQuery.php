<?php

namespace Notification\Notification\Inbox\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetNotificationInboxQuery implements Query
{
    public function __construct(
        public string $userSessionId,
        public int $pageNumber,
        public int $pageSize,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.notification.query.1.notification.inbox';
    }
}
