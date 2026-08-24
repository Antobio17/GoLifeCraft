<?php

namespace Authorization\User\User\Infrastructure\Domain\QueryModel\Doctrine;

use Authorization\User\User\Domain\QueryModel\Dto\GetUserResult;
use Authorization\User\User\Domain\QueryModel\GetUserNeedleDataQuery;
use Doctrine\DBAL\Connection;

final readonly class DoctrineGetUserNeedleDataQuery implements GetUserNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findUserById(string $userId): ?GetUserResult
    {
        $result = $this->connection
            ->createQueryBuilder()
            ->select(
                'u.id',
                'u.username',
                'u.email',
                'u.name',
                'u.lastname',
                'u.role',
                'u.tenant_id',
                'u.is_active',
                'u.email_verified',
                'u.created_at',
                'u.updated_at',
            )
            ->from(table: 'user', alias: 'u')
            ->where('u.id = :userId')
            ->setParameter(key: 'userId', value: $userId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $result) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetUserResult(
            id: $result['id'],
            aggregateName: 'User',
            username: $result['username'],
            email: $result['email'],
            name: $result['name'],
            lastname: $result['lastname'],
            role: $result['role'],
            tenantId: $result['tenant_id'],
            isActive: (bool) $result['is_active'],
            emailVerified: (bool) $result['email_verified'],
            createdAt: new \DateTime(datetime: $result['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $result['updated_at'], timezone: $utc),
        );
    }
}
