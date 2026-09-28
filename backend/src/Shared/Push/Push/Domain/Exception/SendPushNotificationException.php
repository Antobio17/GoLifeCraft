<?php

namespace Shared\Push\Push\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class SendPushNotificationException extends BaseException
{
    public static function notConfigured(): self
    {
        return new static(
            title: 'Push notifications are not configured on this server.',
            keyTranslation: 'push.not.configured',
            details: [],
        );
    }
}
