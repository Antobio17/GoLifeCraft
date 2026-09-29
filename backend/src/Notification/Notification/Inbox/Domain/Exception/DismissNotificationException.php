<?php

namespace Notification\Notification\Inbox\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DismissNotificationException extends BaseException
{
    public static function notFound(string $notificationId): self
    {
        return new static(
            title: 'The notification does not exist.',
            keyTranslation: 'notification.not.found',
            details: ['notificationId' => $notificationId]
        );
    }
}
