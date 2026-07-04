<?php

namespace Shared\Shared\DomainEventLog\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\DomainEventLogUserResult;
use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\GetDomainEventLogsResult;
use Shared\Shared\DomainEventLog\Domain\QueryModel\GetDomainEventLogsNeedleDataQuery;

final readonly class DoctrineGetDomainEventLogsNeedleDataQuery implements GetDomainEventLogsNeedleDataQuery
{
    public function __construct(
        private Connection $tenantConnection,
        private Connection $masterConnection,
    ) {
    }

    public function findDomainEventLogs(
        int $pageSize,
        int $pageNumber,
        ?string $filterEventName = null,
        ?string $filterDateFrom = null,
        ?string $filterDateTo = null,
    ): array {
        $rows = $this->getBaseQuery(
            filterEventName: $filterEventName,
            filterDateFrom: $filterDateFrom,
            filterDateTo: $filterDateTo,
        )
            ->orderBy(sort: 'del.occurred_on', order: 'DESC')
            ->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        $userMap = $this->resolveUsers(rows: $rows);

        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: function (array $row) use ($userMap, $utc): GetDomainEventLogsResult {
            $payload = json_decode(json: $row['payload'], associative: true) ?? [];
            $userId = $this->extractUserId(payload: $payload);
            $user = $userMap[$userId] ?? new DomainEventLogUserResult(
                id: $userId,
                username: '',
                name: '',
                lastname: '',
            );

            return new GetDomainEventLogsResult(
                id: $row['id'],
                aggregateName: 'DomainEventLog',
                eventName: $row['event_name'],
                aggregateId: $row['aggregate_id'],
                payload: $payload,
                occurredOn: (new \DateTime(datetime: $row['occurred_on'], timezone: $utc))->format(format: \DateTimeInterface::ATOM),
                recordedAt: (new \DateTime(datetime: $row['recorded_at'], timezone: $utc))->format(format: \DateTimeInterface::ATOM),
                user: $user,
            );
        }, array: $rows);
    }

    public function totalDomainEventLogs(
        ?string $filterEventName = null,
        ?string $filterDateFrom = null,
        ?string $filterDateTo = null,
    ): int {
        return (int) $this->getBaseQuery(
            filterEventName: $filterEventName,
            filterDateFrom: $filterDateFrom,
            filterDateTo: $filterDateTo,
        )
            ->executeQuery()
            ->rowCount();
    }

    private function getBaseQuery(
        ?string $filterEventName = null,
        ?string $filterDateFrom = null,
        ?string $filterDateTo = null,
    ): QueryBuilder {
        $qb = $this->tenantConnection->createQueryBuilder()
            ->select(
                'del.id',
                'del.event_name',
                'del.aggregate_id',
                'del.payload',
                'del.occurred_on',
                'del.recorded_at',
            )
            ->from(table: 'domain_event_log', alias: 'del');

        if (null !== $filterEventName) {
            $qb->andWhere('del.event_name = :eventName')
                ->setParameter(key: 'eventName', value: $filterEventName);
        }

        if (null !== $filterDateFrom) {
            $qb->andWhere('del.occurred_on >= :dateFrom')
                ->setParameter(key: 'dateFrom', value: $filterDateFrom);
        }

        if (null !== $filterDateTo) {
            $qb->andWhere('del.occurred_on <= :dateTo')
                ->setParameter(key: 'dateTo', value: $filterDateTo);
        }

        return $qb;
    }

    /**
     * @param array<string, mixed>[] $rows
     *
     * @return DomainEventLogUserResult[]
     */
    private function resolveUsers(array $rows): array
    {
        $userIds = [];
        foreach ($rows as $row) {
            $payload = json_decode(json: $row['payload'], associative: true) ?? [];
            $userId = $this->extractUserId(payload: $payload);
            if ('' !== $userId) {
                $userIds[] = $userId;
            }
        }

        $uniqueUserIds = array_values(array: array_unique(array: $userIds));

        if (empty($uniqueUserIds)) {
            return [];
        }

        $users = $this->masterConnection->createQueryBuilder()
            ->select('u.id', 'u.username', 'u.name', 'u.lastname')
            ->from(table: 'user', alias: 'u')
            ->where('u.id IN (:ids)')
            ->setParameter(key: 'ids', value: $uniqueUserIds, type: \Doctrine\DBAL\ArrayParameterType::STRING)
            ->executeQuery()
            ->fetchAllAssociative();

        $userMap = [];
        foreach ($users as $user) {
            $userMap[$user['id']] = new DomainEventLogUserResult(
                id: $user['id'],
                username: $user['username'],
                name: $user['name'],
                lastname: $user['lastname'],
            );
        }

        return $userMap;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function extractUserId(array $payload): string
    {
        foreach ($payload as $key => $value) {
            if (!is_string(value: $value)) {
                continue;
            }

            if (str_ends_with(haystack: $key, needle: 'ByUserId') || str_ends_with(haystack: $key, needle: 'UserId')) {
                return $value;
            }
        }

        return '';
    }
}
