<?php

namespace Notification\Notification\Inbox\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetUnreadNotificationsCountResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        public readonly int $count,
    ) {
        parent::__construct(id: $id, aggregateName: 'UnreadNotificationsCount');
    }
}
