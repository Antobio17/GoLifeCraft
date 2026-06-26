<?php

namespace Mcp\Server\Mcp\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ModelWritten extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $entityAlias,
        public string $operation,
        public array $changedFields,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.mcp.event.1.model.written';
    }
}
