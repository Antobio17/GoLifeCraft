<?php

namespace Economy\Finance\Transaction\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class FinanceTransactionDeleted extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $transactionDate,
        public string $kind,
        public float $amount,
        public string $category,
        public string $note,
        public ?string $store,
        public bool $recurring,
        public string $source,
        public string $deletedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.economy.event.1.finance_transaction.deleted';
    }
}
