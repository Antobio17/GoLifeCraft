<?php

namespace Shared\Shared\DomainEventLog\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetDomainEventLogsResult extends QueryAggregateResult
{
    private array $included = [];

    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $eventName,
        public readonly string $aggregateId,
        public readonly array $payload,
        public readonly string $occurredOn,
        public readonly string $recordedAt,
        public readonly DomainEventLogUserResult $user,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }

    public function setIncluded(array $included): void
    {
        $this->included = $included;
    }

    public function getIncluded(): array
    {
        return $this->included;
    }
}
