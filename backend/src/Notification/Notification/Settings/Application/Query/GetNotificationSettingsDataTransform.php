<?php

namespace Notification\Notification\Settings\Application\Query;

use Notification\Notification\Settings\Domain\QueryModel\Dto\GetNotificationSettingsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetNotificationSettingsDataTransform
{
    public function transform(GetNotificationSettingsResult $settings): QueryResult;
}
