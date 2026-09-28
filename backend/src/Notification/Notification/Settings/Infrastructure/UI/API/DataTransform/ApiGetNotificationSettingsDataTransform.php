<?php

namespace Notification\Notification\Settings\Infrastructure\UI\API\DataTransform;

use Notification\Notification\Settings\Application\Query\GetNotificationSettingsDataTransform;
use Notification\Notification\Settings\Domain\QueryModel\Dto\GetNotificationSettingsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetNotificationSettingsDataTransform implements GetNotificationSettingsDataTransform
{
    public function transform(GetNotificationSettingsResult $settings): QueryResult
    {
        return new QuerySingleResult(item: $settings);
    }
}
