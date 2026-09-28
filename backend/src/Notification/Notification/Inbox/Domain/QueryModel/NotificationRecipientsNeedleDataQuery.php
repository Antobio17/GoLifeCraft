<?php

namespace Notification\Notification\Inbox\Domain\QueryModel;

use Notification\Notification\Inbox\Domain\Model\NotificationRecipient;

interface NotificationRecipientsNeedleDataQuery
{
    /**
     * @return NotificationRecipient[]
     */
    public function activeRecipients(?string $tenantId): array;
}
