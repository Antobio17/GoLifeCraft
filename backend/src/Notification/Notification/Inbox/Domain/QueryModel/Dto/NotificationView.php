<?php

namespace Notification\Notification\Inbox\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class NotificationView extends QueryAggregateResult
{
    /**
     * @param array<string, scalar|null> $params
     */
    public function __construct(
        string $id,
        public readonly string $type,
        public readonly string $module,
        public readonly array $params,
        public readonly string $title,
        public readonly string $body,
        public readonly ?string $url,
        public readonly bool $pushed,
        public readonly bool $unread,
        public readonly \DateTime $deliveredAt,
    ) {
        parent::__construct(id: $id, aggregateName: 'Notification');
    }
}
