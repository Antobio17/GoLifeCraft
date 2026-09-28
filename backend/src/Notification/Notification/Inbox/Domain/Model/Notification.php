<?php

namespace Notification\Notification\Inbox\Domain\Model;

use Notification\Notification\Inbox\Domain\Event\NotificationDelivered;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Shared\Shared\Shared\Domain\Model\Aggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Notification extends Aggregate
{
    private int $version;

    /**
     * @param array<string, scalar|null> $params
     */
    public function __construct(
        public readonly string $id,
        public readonly string $userId,
        public readonly string $type,
        public readonly string $dedupeKey,
        public readonly array $params,
        public readonly string $title,
        public readonly string $body,
        public readonly ?string $url,
        public readonly bool $pushed,
        public readonly \DateTime $dueAt,
        public readonly \DateTime $deliveredAt,
        public readonly \DateTime $createdAt,
        public \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public string $updatedByUserId,
    ) {
    }

    /**
     * @param array<string, scalar|null> $params
     */
    public static function deliver(
        string $id,
        string $userId,
        NotificationType $type,
        string $dedupeKey,
        array $params,
        string $title,
        string $body,
        ?string $url,
        bool $pushed,
        \DateTime $dueAt,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();
        $notification = new self(
            id: $id,
            userId: $userId,
            type: $type->value,
            dedupeKey: $dedupeKey,
            params: $params,
            title: $title,
            body: $body,
            url: $url,
            pushed: $pushed,
            dueAt: $dueAt,
            deliveredAt: $now,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $userId,
            updatedByUserId: $userId,
        );

        $notification->record(event: new NotificationDelivered(
            aggregateId: $id,
            occurredOn: $now,
            userId: $notification->userId,
            type: $notification->type,
            dedupeKey: $notification->dedupeKey,
            params: $notification->params,
            title: $notification->title,
            body: $notification->body,
            url: $notification->url,
            pushed: $notification->pushed,
            dueAt: $notification->dueAt,
            deliveredAt: $notification->deliveredAt,
            createdAt: $notification->createdAt,
            updatedAt: $notification->updatedAt,
            createdByUserId: $notification->createdByUserId,
            updatedByUserId: $notification->updatedByUserId,
        ));

        return $notification;
    }
}
