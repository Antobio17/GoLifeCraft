<?php

namespace Economy\Finance\BalanceCheck\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class FinanceBalanceCheckDeleted extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $accountId,
        public string $checkDate,
        public float $amount,
        public string $note,
        public string $deletedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.economy.event.1.finance_balance_check.deleted';
    }
}
