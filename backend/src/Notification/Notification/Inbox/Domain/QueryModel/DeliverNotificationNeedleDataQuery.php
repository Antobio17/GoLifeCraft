<?php

namespace Notification\Notification\Inbox\Domain\QueryModel;

interface DeliverNotificationNeedleDataQuery
{
    public function isDelivered(string $dedupeKey): bool;
}
