<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\Service\Fake;

use Notification\Notification\Inbox\Domain\Service\Dto\RenderedNotification;
use Notification\Notification\Inbox\Domain\Service\NotificationRenderer;
use Notification\Notification\Settings\Domain\Model\NotificationType;

final class FakeNotificationRenderer implements NotificationRenderer
{
    public function render(NotificationType $type, array $params, string $languageCode): RenderedNotification
    {
        return new RenderedNotification(
            title: sprintf('[%s] %s', $languageCode, (string) ($params['title'] ?? $type->value)),
            body: $type->value,
        );
    }
}
