<?php

namespace Economy\Finance\Budget\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class FinanceBudgetCreated extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $categories
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public float $referenceIncome,
        public float $savingsPercentage,
        public float $savingsAmount,
        public float $allocatedAmount,
        public float $unassignedAmount,
        public array $categories,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.economy.event.1.finance_budget.created';
    }
}
