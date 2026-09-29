<?php

namespace Notification\Notification\Settings\Infrastructure\Domain\QueryModel\InMemory;

use Notification\Notification\Settings\Domain\QueryModel\Dto\NotificationSettingsSnapshot;
use Notification\Notification\Settings\Domain\QueryModel\NotificationSettingsNeedleDataQuery;
use Notification\Notification\Settings\Infrastructure\Domain\Model\InMemory\InMemoryNotificationSettingsRepository;

final readonly class InMemoryNotificationSettingsNeedleDataQuery implements NotificationSettingsNeedleDataQuery
{
    public function __construct(
        private InMemoryNotificationSettingsRepository $repository,
    ) {
    }

    public function current(): NotificationSettingsSnapshot
    {
        $settings = $this->repository->findCurrent();

        if (null === $settings) {
            return NotificationSettingsSnapshot::defaults();
        }

        return NotificationSettingsSnapshot::fromStored(
            timezone: $settings->timezone,
            languageCode: $settings->languageCode,
            quietHoursEnabled: $settings->quietHoursEnabled,
            quietHoursStart: $settings->quietHoursStart,
            quietHoursEnd: $settings->quietHoursEnd,
            preferences: $settings->preferences,
            inboxSeenAt: $settings->inboxSeenAt,
        );
    }
}
