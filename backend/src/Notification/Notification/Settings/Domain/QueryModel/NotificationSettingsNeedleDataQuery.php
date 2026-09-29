<?php

namespace Notification\Notification\Settings\Domain\QueryModel;

use Notification\Notification\Settings\Domain\QueryModel\Dto\NotificationSettingsSnapshot;

interface NotificationSettingsNeedleDataQuery
{
    public function current(): NotificationSettingsSnapshot;
}
