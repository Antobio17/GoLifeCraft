<?php

namespace Authorization\User\Registration\Infrastructure\Domain\QueryModel\Doctrine;

use Authorization\User\Registration\Domain\QueryModel\RegisterUserNeedleDataQuery;
use Doctrine\DBAL\Connection;

final readonly class DoctrineRegisterUserNeedleDataQuery implements RegisterUserNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function userAlreadyExists(string $username): bool
    {
        $result = $this->connection
            ->createQueryBuilder()
            ->select('1')
            ->from(table: 'user')
            ->where('username = :username OR email = :username')
            ->setParameter(key: 'username', value: $username)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }
}
