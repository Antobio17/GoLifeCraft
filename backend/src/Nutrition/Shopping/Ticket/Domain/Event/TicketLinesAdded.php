<?php

namespace Nutrition\Shopping\Ticket\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class TicketLinesAdded extends DomainEvent
{
    /**
     * @param array<int, string>               $addedItemIds
     * @param array<int, array<string, mixed>> $items
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public array $addedItemIds,
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
        return 'golifecraft.nutrition.event.1.ticket.lines_added';
    }
}
