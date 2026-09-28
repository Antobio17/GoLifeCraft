<?php

namespace Notification\Notification\Settings\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Notification\Notification\Settings\Domain\Model\NotificationSettings;
use Notification\Notification\Settings\Domain\Model\NotificationSettingsSnapshot;
use Notification\Notification\Settings\Domain\QueryModel\NotificationSettingsNeedleDataQuery;

final readonly class DoctrineNotificationSettingsNeedleDataQuery implements NotificationSettingsNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function current(): NotificationSettingsSnapshot
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                's.timezone',
                's.language_code',
                's.quiet_hours_enabled',
                's.quiet_hours_start',
                's.quiet_hours_end',
                's.preferences',
                's.inbox_seen_at',
            )
            ->from(table: 'notification_settings', alias: 's')
            ->where('s.id = :id')
            ->setParameter(key: 'id', value: NotificationSettings::SINGLETON_ID)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return NotificationSettingsSnapshot::defaults();
        }

        return NotificationSettingsSnapshot::fromStored(
            timezone: $row['timezone'],
            languageCode: $row['language_code'],
            quietHoursEnabled: (bool) $row['quiet_hours_enabled'],
            quietHoursStart: $row['quiet_hours_start'],
            quietHoursEnd: $row['quiet_hours_end'],
            preferences: json_decode(json: (string) $row['preferences'], associative: true) ?? [],
            inboxSeenAt: null !== $row['inbox_seen_at']
                ? new \DateTime(datetime: $row['inbox_seen_at'], timezone: new \DateTimeZone(timezone: 'UTC'))
                : null,
        );
    }
}
