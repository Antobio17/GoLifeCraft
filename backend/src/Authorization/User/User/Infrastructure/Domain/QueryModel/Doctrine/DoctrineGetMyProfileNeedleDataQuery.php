<?php

namespace Authorization\User\User\Infrastructure\Domain\QueryModel\Doctrine;

use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\QueryModel\Dto\GetMyProfileResult;
use Authorization\User\User\Domain\QueryModel\GetMyProfileNeedleDataQuery;
use Doctrine\DBAL\Connection;

final readonly class DoctrineGetMyProfileNeedleDataQuery implements GetMyProfileNeedleDataQuery
{
    public function __construct(
        private Connection $masterConnection,
        private Connection $tenantConnection,
    ) {
    }

    public function getUserRole(string $userId): ?string
    {
        $result = $this->masterConnection
            ->createQueryBuilder()
            ->select('role')
            ->from(table: 'user')
            ->where('id = :userId')
            ->setParameter(key: 'userId', value: $userId)
            ->executeQuery()
            ->fetchOne();

        return false !== $result ? $result : null;
    }

    public function findUserById(string $userId): ?GetMyProfileResult
    {
        $result = $this->masterConnection
            ->createQueryBuilder()
            ->select(
                'u.id',
                'u.username',
                'u.email',
                'u.name',
                'u.lastname',
                'u.is_active',
                'u.role',
                'u.tenant_id',
                'u.theme',
                'u.visual_preferences',
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

        return new GetMyProfileResult(
            id: $result['id'],
            aggregateName: 'User',
            username: $result['username'],
            email: $result['email'],
            name: $result['name'],
            lastname: $result['lastname'],
            role: $result['role'],
            isActive: (bool) $result['is_active'],
            tenantId: $result['tenant_id'],
            theme: $result['theme'] ?? User::THEME_DARK,
            visualPreferences: User::resolveVisualPreferences(stored: self::decodePreferences(value: $result['visual_preferences'])),
            createdAt: new \DateTime(datetime: $result['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $result['updated_at'], timezone: $utc),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private static function decodePreferences(mixed $value): array
    {
        $decoded = json_decode(json: (string) ($value ?? '{}'), associative: true);

        return is_array(value: $decoded) ? $decoded : [];
    }
}
