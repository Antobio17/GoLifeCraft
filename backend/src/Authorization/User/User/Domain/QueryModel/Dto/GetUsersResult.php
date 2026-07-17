<?php

namespace Authorization\User\User\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetUsersResult extends QueryAggregateResult
{
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $username,
        public readonly string $email,
        public readonly string $name,
        public readonly string $lastname,
        public readonly string $role,
        public readonly string $tenantId,
        public readonly bool $isActive,
        public readonly bool $emailVerified,
        public readonly \DateTime $createdAt,
        public readonly \DateTime $updatedAt,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
