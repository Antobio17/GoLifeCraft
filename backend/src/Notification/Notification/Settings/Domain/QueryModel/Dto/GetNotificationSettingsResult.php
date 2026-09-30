<?php

namespace Notification\Notification\Settings\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetNotificationSettingsResult extends QueryAggregateResult
{
    /**
     * @param array<int, array{type: string, module: string, enabled: bool, time: ?string, leadMinutes: ?int, afterMinutes: ?int}> $preferences
     * @param int[]                                                                                                                $leadMinutesOptions
     * @param int[]                                                                                                                $afterMinutesOptions
     * @param string[]                                                                                                             $languages
     */
    public function __construct(
        string $id,
        public readonly string $timezone,
        public readonly string $languageCode,
        public readonly bool $quietHoursEnabled,
        public readonly string $quietHoursStart,
        public readonly string $quietHoursEnd,
        public readonly array $preferences,
        public readonly array $leadMinutesOptions,
        public readonly array $afterMinutesOptions,
        public readonly array $languages,
    ) {
        parent::__construct(id: $id, aggregateName: 'NotificationSettings');
    }
}
