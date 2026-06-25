<?php

namespace Shared\Shared\DomainEventLog\Domain\QueryModel\Dto;

final class DomainEventLogUserResult
{
    public function __construct(
        public readonly string $id,
        public readonly string $username,
        public readonly string $name,
        public readonly string $lastname,
    ) {
    }
}
