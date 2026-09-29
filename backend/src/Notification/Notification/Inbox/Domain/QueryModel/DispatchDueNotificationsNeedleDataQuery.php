<?php

namespace Notification\Notification\Inbox\Domain\QueryModel;

use Notification\Notification\Inbox\Domain\QueryModel\Dto\AgendaAppointment;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\DiaryMealEntry;

interface DispatchDueNotificationsNeedleDataQuery
{
    /**
     * @return AgendaAppointment[]
     */
    public function pendingAppointments(string $fromDate, string $toDate): array;

    /**
     * @return DiaryMealEntry[]
     */
    public function diaryEntries(string $date): array;

    /**
     * @param string[] $dedupeKeys
     *
     * @return string[]
     */
    public function deliveredDedupeKeys(array $dedupeKeys): array;
}
