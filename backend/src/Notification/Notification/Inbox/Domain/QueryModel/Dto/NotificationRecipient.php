<?php

namespace Notification\Notification\Inbox\Domain\QueryModel\Dto;

final readonly class NotificationRecipient
{
    public function __construct(
        public string $userId,
        public string $tenantId,
    ) {
    }
}
