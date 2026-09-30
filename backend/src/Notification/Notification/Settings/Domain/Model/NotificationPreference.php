<?php

namespace Notification\Notification\Settings\Domain\Model;

use Notification\Notification\Settings\Domain\Exception\UpdateNotificationSettingsException;

final readonly class NotificationPreference
{
    public const int DEFAULT_LEAD_MINUTES = 60;

    /** @var int[] */
    public const array LEAD_MINUTES = [15, 30, 60, 120, 180];

    public const int DEFAULT_AFTER_MINUTES = 120;

    /** @var int[] */
    public const array AFTER_MINUTES = [60, 90, 120, 150, 180, 240];

    public function __construct(
        public NotificationType $type,
        public bool $enabled,
        public ?string $time,
        public ?int $leadMinutes,
        public ?int $afterMinutes,
    ) {
    }

    public static function defaultFor(NotificationType $type): self
    {
        return new self(
            type: $type,
            enabled: false,
            time: $type->defaultTime(),
            leadMinutes: $type->usesLeadMinutes() ? self::DEFAULT_LEAD_MINUTES : null,
            afterMinutes: $type->usesAfterMinutes() ? self::DEFAULT_AFTER_MINUTES : null,
        );
    }

    /**
     * @param array{enabled?: mixed, time?: mixed, leadMinutes?: mixed, afterMinutes?: mixed} $raw
     */
    public static function fromArray(NotificationType $type, array $raw): self
    {
        $default = self::defaultFor(type: $type);

        return new self(
            type: $type,
            enabled: (bool) ($raw['enabled'] ?? $default->enabled),
            time: $type->usesTime() ? (string) ($raw['time'] ?? $default->time) : null,
            leadMinutes: $type->usesLeadMinutes() ? (int) ($raw['leadMinutes'] ?? $default->leadMinutes) : null,
            afterMinutes: $type->usesAfterMinutes() ? (int) ($raw['afterMinutes'] ?? $default->afterMinutes) : null,
        );
    }

    public function assertValid(): void
    {
        if ($this->type->usesTime() && !self::isClockTime(value: (string) $this->time)) {
            throw UpdateNotificationSettingsException::invalidTime(type: $this->type->value, time: (string) $this->time);
        }

        if ($this->type->usesLeadMinutes() && !in_array(needle: $this->leadMinutes, haystack: self::LEAD_MINUTES, strict: true)) {
            throw UpdateNotificationSettingsException::invalidLeadMinutes(type: $this->type->value, leadMinutes: (int) $this->leadMinutes);
        }

        if ($this->type->usesAfterMinutes() && !in_array(needle: $this->afterMinutes, haystack: self::AFTER_MINUTES, strict: true)) {
            throw UpdateNotificationSettingsException::invalidAfterMinutes(type: $this->type->value, afterMinutes: (int) $this->afterMinutes);
        }
    }

    /**
     * @return array{enabled: bool, time: ?string, leadMinutes: ?int, afterMinutes: ?int}
     */
    public function toArray(): array
    {
        return [
            'enabled' => $this->enabled,
            'time' => $this->time,
            'leadMinutes' => $this->leadMinutes,
            'afterMinutes' => $this->afterMinutes,
        ];
    }

    public static function isClockTime(string $value): bool
    {
        return 1 === preg_match(pattern: '/^([01]\d|2[0-3]):[0-5]\d$/', subject: $value);
    }
}
