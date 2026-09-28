<?php

namespace Notification\Notification\Settings\Infrastructure\Domain\Model\InMemory;

use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Domain\Model\NotificationSettingsRepository;

final class InMemoryNotificationSettingsRepository implements NotificationSettingsRepository
{
    private ?NotificationSettings $notificationSettings = null;

    public function findCurrent(): ?NotificationSettings
    {
        return $this->notificationSettings;
    }

    public function save(NotificationSettings $notificationSettings): void
    {
        $this->notificationSettings = $notificationSettings;
    }
}
