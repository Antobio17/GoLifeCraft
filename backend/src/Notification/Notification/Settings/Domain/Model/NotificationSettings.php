<?php

namespace Notification\Notification\Settings\Domain\Model;

use Notification\Notification\Settings\Domain\Event\NotificationInboxSeen;
use Notification\Notification\Settings\Domain\Event\NotificationSettingsConfigured;
use Notification\Notification\Settings\Domain\Exception\UpdateNotificationSettingsException;
use Shared\Shared\Shared\Domain\Model\Aggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class NotificationSettings extends Aggregate
{
    public const string SINGLETON_ID = 'notification-settings';
    public const string DEFAULT_TIMEZONE = 'Europe/Madrid';
    public const string DEFAULT_LANGUAGE = 'es';
    public const string DEFAULT_QUIET_HOURS_START = '23:00';
    public const string DEFAULT_QUIET_HOURS_END = '08:00';

    /** @var string[] */
    public const array LANGUAGES = ['es', 'en'];

    private int $version;

    /**
     * @param array<string, array{enabled: bool, time: ?string, leadMinutes: ?int}> $preferences
     */
    public function __construct(
        public readonly string $id,
        public string $userId,
        public string $timezone,
        public string $languageCode,
        public bool $quietHoursEnabled,
        public string $quietHoursStart,
        public string $quietHoursEnd,
        public array $preferences,
        public ?\DateTime $inboxSeenAt,
        public readonly \DateTime $createdAt,
        public \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public string $updatedByUserId,
    ) {
    }

    /**
     * @param array<int, array{type?: mixed, enabled?: mixed, time?: mixed, leadMinutes?: mixed}> $preferences
     */
    public static function create(
        string $id,
        string $userId,
        string $timezone,
        string $languageCode,
        bool $quietHoursEnabled,
        string $quietHoursStart,
        string $quietHoursEnd,
        array $preferences,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        self::assertSettings(
            timezone: $timezone,
            languageCode: $languageCode,
            quietHoursStart: $quietHoursStart,
            quietHoursEnd: $quietHoursEnd,
        );

        $now = $dateTimeGenerator->now();
        $settings = new self(
            id: $id,
            userId: $userId,
            timezone: $timezone,
            languageCode: $languageCode,
            quietHoursEnabled: $quietHoursEnabled,
            quietHoursStart: $quietHoursStart,
            quietHoursEnd: $quietHoursEnd,
            preferences: self::resolvePreferences(raw: $preferences),
            inboxSeenAt: null,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $userId,
            updatedByUserId: $userId,
        );

        $settings->recordConfigured(now: $now);

        return $settings;
    }

    public static function createDefault(string $id, string $userId, DateTimeGenerator $dateTimeGenerator): self
    {
        return self::create(
            id: $id,
            userId: $userId,
            timezone: self::DEFAULT_TIMEZONE,
            languageCode: self::DEFAULT_LANGUAGE,
            quietHoursEnabled: false,
            quietHoursStart: self::DEFAULT_QUIET_HOURS_START,
            quietHoursEnd: self::DEFAULT_QUIET_HOURS_END,
            preferences: [],
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    /**
     * @param array<int, array{type?: mixed, enabled?: mixed, time?: mixed, leadMinutes?: mixed}> $preferences
     */
    public function update(
        string $timezone,
        string $languageCode,
        bool $quietHoursEnabled,
        string $quietHoursStart,
        string $quietHoursEnd,
        array $preferences,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        self::assertSettings(
            timezone: $timezone,
            languageCode: $languageCode,
            quietHoursStart: $quietHoursStart,
            quietHoursEnd: $quietHoursEnd,
        );

        $now = $dateTimeGenerator->now();
        $this->timezone = $timezone;
        $this->languageCode = $languageCode;
        $this->quietHoursEnabled = $quietHoursEnabled;
        $this->quietHoursStart = $quietHoursStart;
        $this->quietHoursEnd = $quietHoursEnd;
        $this->preferences = self::resolvePreferences(raw: $preferences);
        $this->updatedAt = $now;
        $this->updatedByUserId = $updatedByUserId;

        $this->recordConfigured(now: $now);
    }

    public function markInboxSeen(string $seenByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        $now = $dateTimeGenerator->now();
        $this->inboxSeenAt = $now;
        $this->updatedAt = $now;
        $this->updatedByUserId = $seenByUserId;

        $this->record(event: new NotificationInboxSeen(
            aggregateId: $this->id,
            occurredOn: $now,
            userId: $this->userId,
            timezone: $this->timezone,
            languageCode: $this->languageCode,
            quietHoursEnabled: $this->quietHoursEnabled,
            quietHoursStart: $this->quietHoursStart,
            quietHoursEnd: $this->quietHoursEnd,
            preferences: $this->preferences,
            inboxSeenAt: $now,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    private function recordConfigured(\DateTime $now): void
    {
        $this->record(event: new NotificationSettingsConfigured(
            aggregateId: $this->id,
            occurredOn: $now,
            userId: $this->userId,
            timezone: $this->timezone,
            languageCode: $this->languageCode,
            quietHoursEnabled: $this->quietHoursEnabled,
            quietHoursStart: $this->quietHoursStart,
            quietHoursEnd: $this->quietHoursEnd,
            preferences: $this->preferences,
            inboxSeenAt: $this->inboxSeenAt,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    private static function assertSettings(
        string $timezone,
        string $languageCode,
        string $quietHoursStart,
        string $quietHoursEnd,
    ): void {
        if (!in_array(needle: $timezone, haystack: \DateTimeZone::listIdentifiers(), strict: true)) {
            throw UpdateNotificationSettingsException::invalidTimezone(timezone: $timezone);
        }

        if (!in_array(needle: $languageCode, haystack: self::LANGUAGES, strict: true)) {
            throw UpdateNotificationSettingsException::invalidLanguage(languageCode: $languageCode);
        }

        if (!NotificationPreference::isClockTime(value: $quietHoursStart) || !NotificationPreference::isClockTime(value: $quietHoursEnd)) {
            throw UpdateNotificationSettingsException::invalidQuietHours(start: $quietHoursStart, end: $quietHoursEnd);
        }
    }

    /**
     * @param array<int, array{type?: mixed, enabled?: mixed, time?: mixed, leadMinutes?: mixed}> $raw
     *
     * @return array<string, array{enabled: bool, time: ?string, leadMinutes: ?int}>
     */
    private static function resolvePreferences(array $raw): array
    {
        $resolved = [];

        foreach ($raw as $item) {
            $type = NotificationType::tryFrom(value: (string) ($item['type'] ?? ''));

            if (null === $type) {
                throw UpdateNotificationSettingsException::unknownType(type: (string) ($item['type'] ?? ''));
            }

            $preference = NotificationPreference::fromArray(type: $type, raw: $item);
            $preference->assertValid();
            $resolved[$type->value] = $preference->toArray();
        }

        foreach (NotificationType::cases() as $type) {
            $resolved[$type->value] ??= NotificationPreference::defaultFor(type: $type)->toArray();
        }

        return $resolved;
    }
}
