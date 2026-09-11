<?php

namespace Nutrition\Shopping\Ticket\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class TicketItemUnlinked extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $items
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $itemId,
        public string $rawName,
        public string $previousArticleId,
        public string $storeName,
        public ?string $supermarketId,
        public string $purchasedOn,
        public ?float $total,
        public string $note,
        public string $status,
        public array $items,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.ticket.item_unlinked';
    }
}
