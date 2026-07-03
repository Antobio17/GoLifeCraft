<?php

namespace Authorization\User\User\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetUserResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $username,
        public readonly string $email,
        public readonly string $name,
        public readonly string $lastname,
        public readonly string $role,
        public readonly bool $isActive,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
