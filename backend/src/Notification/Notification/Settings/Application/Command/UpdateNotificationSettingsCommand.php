<?php

namespace Notification\Notification\Settings\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateNotificationSettingsCommand implements Command
{
    /**
     * @param array<int, array{type?: mixed, enabled?: mixed, time?: mixed, leadMinutes?: mixed, afterMinutes?: mixed}> $preferences
     */
    public function __construct(
        public string $timezone,
        public string $languageCode,
        public bool $quietHoursEnabled,
        public string $quietHoursStart,
        public string $quietHoursEnd,
        public array $preferences,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.notification.command.1.notification_settings.update';
    }
}
