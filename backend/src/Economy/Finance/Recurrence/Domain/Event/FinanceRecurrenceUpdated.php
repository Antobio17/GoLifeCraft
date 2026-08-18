<?php

namespace Economy\Finance\Recurrence\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class FinanceRecurrenceUpdated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $accountId,
        public string $kind,
        public float $amount,
        public string $category,
        public string $note,
        public ?string $store,
        public int $dayOfMonth,
        public string $startMonth,
        public ?string $endMonth,
        public bool $active,
        public ?string $lastRunMonth,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.economy.event.1.finance_recurrence.updated';
    }
}
