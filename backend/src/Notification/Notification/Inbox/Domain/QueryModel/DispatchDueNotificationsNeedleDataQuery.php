<?php

namespace Notification\Notification\Inbox\Domain\QueryModel;

use Notification\Notification\Inbox\Domain\QueryModel\Dto\AgendaAppointment;

interface DispatchDueNotificationsNeedleDataQuery
{
    /**
     * @return AgendaAppointment[]
     */
    public function pendingAppointments(string $fromDate, string $toDate): array;

    /**
     * @param string[] $dedupeKeys
     *
     * @return string[]
     */
    public function deliveredDedupeKeys(array $dedupeKeys): array;
}
