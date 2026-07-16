<?php

namespace Authorization\User\PasswordResetToken\Infrastructure\Domain\QueryModel\Doctrine;

use Authorization\User\PasswordResetToken\Domain\QueryModel\Dto\FindUserResult;
use Authorization\User\PasswordResetToken\Domain\QueryModel\RequestPasswordResetNeedleDataQuery;
use Doctrine\DBAL\Connection;

final readonly class DoctrineRequestPasswordResetNeedleDataQuery implements RequestPasswordResetNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findUserByUsername(string $username): ?FindUserResult
    {
        $result = $this->connection
            ->createQueryBuilder()
            ->select('id', 'username', 'email', 'name')
            ->from(table: 'user')
            ->where('username = :username')
            ->setParameter(key: 'username', value: $username)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $result) {
            return null;
        }

        return new FindUserResult(
            id: $result['id'],
            username: $result['username'],
            email: $result['email'],
            name: $result['name'] ?? '',
        );
    }
}
