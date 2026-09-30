<?php

namespace Notification\Notification\Settings\Domain\QueryModel\Dto;

use Notification\Notification\Settings\Domain\Model\NotificationPreference;
use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Domain\Model\NotificationType;

final readonly class NotificationSettingsSnapshot
{
    /**
     * @param array<string, NotificationPreference> $preferences
     */
    public function __construct(
        public string $timezone,
        public string $languageCode,
        public bool $quietHoursEnabled,
        public string $quietHoursStart,
        public string $quietHoursEnd,
        public array $preferences,
        public ?\DateTime $inboxSeenAt,
    ) {
    }

    public static function defaults(): self
    {
        return self::fromStored(
            timezone: NotificationSettings::DEFAULT_TIMEZONE,
            languageCode: NotificationSettings::DEFAULT_LANGUAGE,
            quietHoursEnabled: false,
            quietHoursStart: NotificationSettings::DEFAULT_QUIET_HOURS_START,
            quietHoursEnd: NotificationSettings::DEFAULT_QUIET_HOURS_END,
            preferences: [],
            inboxSeenAt: null,
        );
    }

    /**
     * @param array<string, array{enabled?: mixed, time?: mixed, leadMinutes?: mixed, afterMinutes?: mixed}> $preferences
     */
    public static function fromStored(
        string $timezone,
        string $languageCode,
        bool $quietHoursEnabled,
        string $quietHoursStart,
        string $quietHoursEnd,
        array $preferences,
        ?\DateTime $inboxSeenAt,
    ): self {
        $resolved = [];

        foreach (NotificationType::cases() as $type) {
            $resolved[$type->value] = NotificationPreference::fromArray(
                type: $type,
                raw: $preferences[$type->value] ?? [],
            );
        }

        return new self(
            timezone: $timezone,
            languageCode: $languageCode,
            quietHoursEnabled: $quietHoursEnabled,
            quietHoursStart: $quietHoursStart,
            quietHoursEnd: $quietHoursEnd,
            preferences: $resolved,
            inboxSeenAt: $inboxSeenAt,
        );
    }

    public function preference(NotificationType $type): NotificationPreference
    {
        return $this->preferences[$type->value];
    }

    public function localNow(\DateTimeInterface $now): \DateTimeImmutable
    {
        return \DateTimeImmutable::createFromInterface(object: $now)
            ->setTimezone(timezone: new \DateTimeZone(timezone: $this->timezone));
    }

    public function isQuietAt(\DateTimeInterface $now): bool
    {
        if (!$this->quietHoursEnabled) {
            return false;
        }

        $clock = $this->localNow(now: $now)->format(format: 'H:i');

        if ($this->quietHoursStart === $this->quietHoursEnd) {
            return false;
        }

        if ($this->quietHoursStart < $this->quietHoursEnd) {
            return $clock >= $this->quietHoursStart && $clock < $this->quietHoursEnd;
        }

        return $clock >= $this->quietHoursStart || $clock < $this->quietHoursEnd;
    }
}
