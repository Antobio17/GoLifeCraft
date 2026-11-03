<?php

namespace Gamification\Achievement\Achievement\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\AchievementOwner;
use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\TrackedDomainEvent;
use Gamification\Achievement\Achievement\Domain\QueryModel\RebuildAchievementsNeedleDataQuery;

final readonly class DoctrineRebuildAchievementsNeedleDataQuery implements RebuildAchievementsNeedleDataQuery
{
    public function __construct(
        private Connection $masterConnection,
        private Connection $tenantConnection,
    ) {
    }

    public function owners(?string $tenantId): array
    {
        $queryBuilder = $this->masterConnection->createQueryBuilder()
            ->select('u.id', 'u.tenant_id')
            ->from(table: '`user`', alias: 'u')
            ->where('u.is_active = 1')
            ->andWhere('u.tenant_id IS NOT NULL')
            ->orderBy('u.tenant_id', 'ASC');

        if (null !== $tenantId) {
            $queryBuilder
                ->andWhere('u.tenant_id = :tenantId')
                ->setParameter(key: 'tenantId', value: $tenantId);
        }

        return array_map(
            callback: static fn (array $row): AchievementOwner => new AchievementOwner(
                userId: (string) $row['id'],
                tenantId: (string) $row['tenant_id'],
            ),
            array: $queryBuilder->executeQuery()->fetchAllAssociative(),
        );
    }

    public function progressDefinitionKeys(): array
    {
        return array_map(
            callback: 'strval',
            array: $this->tenantConnection->createQueryBuilder()
                ->select('p.definition_key')
                ->from(table: 'achievement_progress', alias: 'p')
                ->executeQuery()
                ->fetchFirstColumn(),
        );
    }

    public function trackedEvents(array $eventNames): array
    {
        if ([] === $eventNames) {
            return [];
        }

        $rows = $this->tenantConnection->createQueryBuilder()
            ->select('l.event_name', 'l.payload', 'l.occurred_on')
            ->from(table: 'domain_event_log', alias: 'l')
            ->where('l.event_name IN (:eventNames)')
            ->setParameter(key: 'eventNames', value: $eventNames, type: ArrayParameterType::STRING)
            ->orderBy('l.occurred_on', 'ASC')
            ->addOrderBy('l.recorded_at', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(
            callback: static fn (array $row): TrackedDomainEvent => new TrackedDomainEvent(
                eventName: (string) $row['event_name'],
                payload: json_decode(json: (string) $row['payload'], associative: true) ?? [],
                occurredOn: (new \DateTimeImmutable(datetime: (string) $row['occurred_on'], timezone: new \DateTimeZone(timezone: 'UTC')))
                    ->format(format: \DateTimeInterface::ATOM),
            ),
            array: $rows,
        );
    }
}
