<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetTicketResult extends QueryAggregateResult
{
    /**
     * @param TicketItemView[] $items
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $storeName,
        public readonly ?string $supermarketId,
        public readonly ?string $supermarketName,
        public readonly string $purchasedOn,
        public readonly ?float $total,
        public readonly string $note,
        public readonly string $status,
        public readonly int $totalItems,
        public readonly int $linkedItems,
        public readonly int $pendingItems,
        public readonly int $receivedItems,
        public readonly float $linkedAmount,
        public readonly array $items,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public readonly string $updatedByUserId,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
