<?php

namespace Economy\Finance\Transaction\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class FinanceTransactionUpdated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $accountId,
        public string $transactionDate,
        public string $kind,
        public float $amount,
        public string $category,
        public string $note,
        public ?string $store,
        public bool $recurring,
        public string $source,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.economy.event.1.finance_transaction.updated';
    }
}
