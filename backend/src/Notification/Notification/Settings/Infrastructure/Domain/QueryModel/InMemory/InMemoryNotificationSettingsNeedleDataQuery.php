<?php

namespace Notification\Notification\Settings\Infrastructure\Domain\QueryModel\InMemory;

use Notification\Notification\Settings\Domain\Model\NotificationSettingsSnapshot;
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
        return $this->repository->findCurrent()?->snapshot() ?? NotificationSettingsSnapshot::defaults();
    }
}
