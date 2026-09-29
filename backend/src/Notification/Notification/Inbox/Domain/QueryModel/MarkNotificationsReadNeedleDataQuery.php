<?php

namespace Notification\Notification\Inbox\Domain\QueryModel;

interface MarkNotificationsReadNeedleDataQuery
{
    /**
     * @return string[]
     */
    public function unreadDeliveredUntil(string $userId, \DateTime $until): array;
}
