<?php

namespace Notification\Notification\Inbox\Domain\Service;

use Notification\Notification\Inbox\Domain\Service\Dto\RenderedNotification;
use Notification\Notification\Settings\Domain\Model\NotificationType;

interface NotificationRenderer
{
    /**
     * @param array<string, scalar|null> $params
     */
    public function render(NotificationType $type, array $params, string $languageCode): RenderedNotification;
}
