<?php

namespace Notification\Notification\PushSubscription\Domain\Exception;

use Notification\Notification\PushSubscription\Domain\Model\PushSubscription;
use Shared\Shared\Shared\Domain\Exception\BaseException;

final class SubscribeToPushNotificationsException extends BaseException
{
    public static function invalidEndpoint(string $endpoint): self
    {
        return new static(
            title: 'The push subscription endpoint must be an https URL.',
            keyTranslation: 'push.subscription.invalid.endpoint',
            details: ['endpoint' => mb_substr(string: $endpoint, start: 0, length: 255)],
        );
    }

    public static function missingKeys(): self
    {
        return new static(
            title: 'The push subscription must carry its p256dh and auth keys.',
            keyTranslation: 'push.subscription.missing.keys',
            details: [],
        );
    }

    public static function invalidContentEncoding(string $contentEncoding): self
    {
        return new static(
            title: 'Unsupported push content encoding.',
            keyTranslation: 'push.subscription.invalid.content.encoding',
            details: ['contentEncoding' => $contentEncoding, 'validContentEncodings' => PushSubscription::CONTENT_ENCODINGS],
        );
    }
}
