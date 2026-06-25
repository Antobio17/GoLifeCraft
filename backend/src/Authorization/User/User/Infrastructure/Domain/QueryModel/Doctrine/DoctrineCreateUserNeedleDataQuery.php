<?php

namespace Authorization\User\User\Infrastructure\Domain\QueryModel\Doctrine;

use Authorization\User\User\Domain\QueryModel\CreateUserNeedleDataQuery;
use Doctrine\DBAL\Connection;

final readonly class DoctrineCreateUserNeedleDataQuery implements CreateUserNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function userAlreadyExists(string $username): bool
    {
        return false !== $this->connection
            ->createQueryBuilder()
            ->select('1')
            ->from(from: 'user')
            ->where('username = :username')
            ->setParameter(key: 'username', value: $username)
            ->executeQuery()
            ->fetchOne();
    }

    public function getTenantIdFromUserCreating(string $userId): ?string
    {
        return $this->connection
            ->createQueryBuilder()
            ->select('tenant_id')
            ->from(from: 'user')
            ->where('id = :userId')
            ->setParameter(key: 'userId', value: $userId)
            ->executeQuery()
            ->fetchOne() ?: null;
    }
}
