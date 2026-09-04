<?php

namespace Economy\Finance\Account\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class FinanceAccountDeleted extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public string $type,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $deletedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.economy.event.1.finance_account.deleted';
    }
}
