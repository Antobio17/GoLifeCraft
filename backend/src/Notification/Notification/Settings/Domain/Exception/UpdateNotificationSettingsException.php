<?php

namespace Notification\Notification\Settings\Domain\Exception;

use Notification\Notification\Settings\Domain\Model\NotificationPreference;
use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Shared\Shared\Shared\Domain\Exception\BaseException;

final class UpdateNotificationSettingsException extends BaseException
{
    public static function invalidTimezone(string $timezone): self
    {
        return new static(
            title: 'The timezone is not a valid IANA identifier.',
            keyTranslation: 'notification.settings.invalid.timezone',
            details: ['timezone' => $timezone],
        );
    }

    public static function invalidLanguage(string $languageCode): self
    {
        return new static(
            title: 'The notification language is not supported.',
            keyTranslation: 'notification.settings.invalid.language',
            details: ['languageCode' => $languageCode, 'validLanguages' => NotificationSettings::LANGUAGES],
        );
    }

    public static function invalidQuietHours(string $start, string $end): self
    {
        return new static(
            title: 'Quiet hours must be HH:MM clock times.',
            keyTranslation: 'notification.settings.invalid.quiet.hours',
            details: ['start' => $start, 'end' => $end],
        );
    }

    public static function unknownType(string $type): self
    {
        return new static(
            title: 'Unknown notification type.',
            keyTranslation: 'notification.settings.unknown.type',
            details: ['type' => $type, 'validTypes' => NotificationType::values()],
        );
    }

    public static function invalidTime(string $type, string $time): self
    {
        return new static(
            title: 'The notification time must be an HH:MM clock time.',
            keyTranslation: 'notification.settings.invalid.time',
            details: ['type' => $type, 'time' => $time],
        );
    }

    public static function invalidLeadMinutes(string $type, int $leadMinutes): self
    {
        return new static(
            title: 'The notification lead time is not allowed.',
            keyTranslation: 'notification.settings.invalid.lead.minutes',
            details: ['type' => $type, 'leadMinutes' => $leadMinutes, 'validLeadMinutes' => NotificationPreference::LEAD_MINUTES],
        );
    }
}
