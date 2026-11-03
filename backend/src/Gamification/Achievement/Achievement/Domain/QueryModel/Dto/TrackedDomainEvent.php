<?php

namespace Gamification\Achievement\Achievement\Domain\QueryModel\Dto;

final readonly class TrackedDomainEvent
{
    /**
     * @param array<string, mixed> $payload
     */
    public function __construct(
        public string $eventName,
        public array $payload,
        public string $occurredOn,
    ) {
    }
}
