<?php

namespace App\Tests\Notification\Notification\Settings\Domain\Model;

use Notification\Notification\Settings\Domain\Model\NotificationSettingsSnapshot;
use PHPUnit\Framework\TestCase;

final class NotificationSettingsSnapshotTest extends TestCase
{
    public function testQuietHoursWrapAroundMidnightInTheUserTimezone(): void
    {
        $settings = $this->snapshot(start: '23:00', end: '08:00');

        $this->assertTrue(condition: $settings->isQuietAt(now: new \DateTimeImmutable(datetime: '2026-09-28T22:30:00+00:00')));
        $this->assertTrue(condition: $settings->isQuietAt(now: new \DateTimeImmutable(datetime: '2026-09-29T05:59:00+00:00')));
        $this->assertFalse(condition: $settings->isQuietAt(now: new \DateTimeImmutable(datetime: '2026-09-29T06:00:00+00:00')));
        $this->assertFalse(condition: $settings->isQuietAt(now: new \DateTimeImmutable(datetime: '2026-09-28T20:59:00+00:00')));
    }

    public function testQuietHoursWithinTheSameDay(): void
    {
        $settings = $this->snapshot(start: '14:00', end: '16:00');

        $this->assertTrue(condition: $settings->isQuietAt(now: new \DateTimeImmutable(datetime: '2026-09-28T12:30:00+00:00')));
        $this->assertFalse(condition: $settings->isQuietAt(now: new \DateTimeImmutable(datetime: '2026-09-28T14:00:00+00:00')));
    }

    private function snapshot(string $start, string $end): NotificationSettingsSnapshot
    {
        return NotificationSettingsSnapshot::fromStored(
            timezone: 'Europe/Madrid',
            languageCode: 'es',
            quietHoursEnabled: true,
            quietHoursStart: $start,
            quietHoursEnd: $end,
            preferences: [],
            inboxSeenAt: null,
        );
    }
}
