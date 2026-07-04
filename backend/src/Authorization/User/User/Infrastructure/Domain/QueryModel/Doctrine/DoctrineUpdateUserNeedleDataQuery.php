<?php

namespace Authorization\User\User\Infrastructure\Domain\QueryModel\Doctrine;

use Authorization\User\User\Domain\QueryModel\UpdateUserNeedleDataQuery;
use Doctrine\DBAL\Connection;

final readonly class DoctrineUpdateUserNeedleDataQuery implements UpdateUserNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function getUserRole(string $userId): ?string
    {
        $result = $this->connection
            ->createQueryBuilder()
            ->select('role')
            ->from(table: 'user')
            ->where('id = :userId')
            ->setParameter(key: 'userId', value: $userId)
            ->executeQuery()
            ->fetchOne();

        return false !== $result ? $result : null;
    }

    public function usernameAlreadyExists(string $username, string $excludeUserId): bool
    {
        return false !== $this->connection
            ->createQueryBuilder()
            ->select('1')
            ->from(table: 'user')
            ->where('username = :username')
            ->andWhere('id != :excludeUserId')
            ->setParameter(key: 'username', value: $username)
            ->setParameter(key: 'excludeUserId', value: $excludeUserId)
            ->executeQuery()
            ->fetchOne();
    }
}
