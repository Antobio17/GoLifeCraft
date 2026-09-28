<?php

namespace Notification\Notification\Settings\Domain\QueryModel;

use Notification\Notification\Settings\Domain\Model\NotificationSettingsSnapshot;

interface NotificationSettingsNeedleDataQuery
{
    public function current(): NotificationSettingsSnapshot;
}
