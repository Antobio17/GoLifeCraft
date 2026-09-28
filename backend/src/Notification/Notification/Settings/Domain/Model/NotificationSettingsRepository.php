<?php

namespace Notification\Notification\Settings\Domain\Model;

interface NotificationSettingsRepository
{
    public function findCurrent(): ?NotificationSettings;

    public function save(NotificationSettings $notificationSettings): void;
}
