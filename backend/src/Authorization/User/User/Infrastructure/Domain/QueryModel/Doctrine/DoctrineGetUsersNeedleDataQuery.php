<?php

namespace Authorization\User\User\Infrastructure\Domain\QueryModel\Doctrine;

use Authorization\User\User\Domain\QueryModel\Dto\GetUsersResult;
use Authorization\User\User\Domain\QueryModel\GetUsersNeedleDataQuery;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;

final readonly class DoctrineGetUsersNeedleDataQuery implements GetUsersNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findUsersByTenantId(
        string $tenantId,
        int $pageSize,
        int $pageNumber,
        ?string $filterUsername = null,
        ?string $filterEmail = null,
        ?string $filterRole = null,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery(
            tenantId: $tenantId,
            filterUsername: $filterUsername,
            filterEmail: $filterEmail,
            filterRole: $filterRole,
        );

        if (null !== $orderBy) {
            $this->applyOrdering(qb: $qb, orderBy: $orderBy);
        }

        $result = $qb->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
           ->setMaxResults(maxResults: $pageSize)
           ->executeQuery()
           ->fetchAllAssociative();

        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: function ($row) use ($utc): GetUsersResult {
            return new GetUsersResult(
                id: $row['id'],
                aggregateName: 'User',
                username: $row['username'],
                email: $row['email'],
                name: $row['name'],
                lastname: $row['lastname'],
                isActive: (bool) $row['is_active'],
                role: $row['role'],
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            );
        }, array: $result);
    }

    public function totalUsers(
        string $tenantId,
        ?string $filterUsername = null,
        ?string $filterEmail = null,
        ?string $filterRole = null,
    ): int {
        return $this->getBaseQuery(
            tenantId: $tenantId,
            filterUsername: $filterUsername,
            filterEmail: $filterEmail,
            filterRole: $filterRole,
        )
            ->executeQuery()
            ->rowCount();
    }

    private function getBaseQuery(
        string $tenantId,
        ?string $filterUsername = null,
        ?string $filterEmail = null,
        ?string $filterRole = null,
    ): QueryBuilder {
        $qb = $this->connection->createQueryBuilder()
            ->select(
                'u.id',
                'u.username',
                'u.email',
                'u.name',
                'u.lastname',
                'u.is_active',
                'u.role',
                'u.created_at',
                'u.updated_at',
            )
            ->from(from: 'user', alias: 'u')
            ->where('u.tenant_id = :tenantId')
            ->setParameter(key: 'tenantId', value: $tenantId);

        if (null !== $filterUsername) {
            $qb->andWhere('u.username LIKE :username')
                ->setParameter(key: 'username', value: '%'.$filterUsername.'%');
        }

        if (null !== $filterEmail) {
            $qb->andWhere('u.email LIKE :email')
                ->setParameter(key: 'email', value: '%'.$filterEmail.'%');
        }

        if (null !== $filterRole) {
            $qb->andWhere('u.role = :role')
                ->setParameter(key: 'role', value: $filterRole);
        }

        return $qb;
    }

    private function applyOrdering(QueryBuilder $qb, string $orderBy): void
    {
        $direction = 'ASC';
        $field = $orderBy;

        if (str_starts_with(haystack: $orderBy, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $orderBy, offset: 1);
        }

        $allowedFields = [
            'username' => 'u.username',
            'email' => 'u.email',
            'name' => 'u.name',
            'lastname' => 'u.lastname',
            'createdAt' => 'u.created_at',
            'updatedAt' => 'u.updated_at',
        ];

        if (!isset($allowedFields[$field])) {
            return;
        }

        $qb->orderBy(sort: $allowedFields[$field], order: $direction);
    }
}
