<?php

namespace Notification\Notification\Settings\Application\Query;

use Notification\Notification\Settings\Domain\Model\NotificationPreference;
use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Domain\QueryModel\Dto\GetNotificationSettingsResult;
use Notification\Notification\Settings\Domain\QueryModel\NotificationSettingsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetNotificationSettingsQueryHandler
{
    public function __construct(
        private NotificationSettingsNeedleDataQuery $needleDataQuery,
        private GetNotificationSettingsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetNotificationSettingsQuery $query): QueryResult
    {
        $settings = $this->needleDataQuery->current();

        return $this->dataTransform->transform(settings: new GetNotificationSettingsResult(
            id: NotificationSettings::SINGLETON_ID,
            timezone: $settings->timezone,
            languageCode: $settings->languageCode,
            quietHoursEnabled: $settings->quietHoursEnabled,
            quietHoursStart: $settings->quietHoursStart,
            quietHoursEnd: $settings->quietHoursEnd,
            preferences: array_values(array: array_map(
                callback: static fn (NotificationPreference $preference): array => [
                    'type' => $preference->type->value,
                    'module' => $preference->type->module(),
                    ...$preference->toArray(),
                ],
                array: $settings->preferences,
            )),
            leadMinutesOptions: NotificationPreference::LEAD_MINUTES,
            afterMinutesOptions: NotificationPreference::AFTER_MINUTES,
            languages: NotificationSettings::LANGUAGES,
        ));
    }
}
