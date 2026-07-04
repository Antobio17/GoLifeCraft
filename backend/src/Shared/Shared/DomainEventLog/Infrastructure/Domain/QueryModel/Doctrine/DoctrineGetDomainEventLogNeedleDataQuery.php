<?php

namespace Shared\Shared\DomainEventLog\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\DomainEventLogUserResult;
use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\GetDomainEventLogsResult;
use Shared\Shared\DomainEventLog\Domain\QueryModel\GetDomainEventLogNeedleDataQuery;

final readonly class DoctrineGetDomainEventLogNeedleDataQuery implements GetDomainEventLogNeedleDataQuery
{
    public function __construct(
        private Connection $tenantConnection,
        private Connection $masterConnection,
    ) {
    }

    public function findDomainEventLogById(string $domainEventLogId): ?GetDomainEventLogsResult
    {
        $utc = new \DateTimeZone(timezone: 'UTC');

        $row = $this->tenantConnection->createQueryBuilder()
            ->select(
                'del.id',
                'del.event_name',
                'del.aggregate_id',
                'del.payload',
                'del.occurred_on',
                'del.recorded_at',
            )
            ->from(table: 'domain_event_log', alias: 'del')
            ->where('del.id = :id')
            ->setParameter(key: 'id', value: $domainEventLogId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $payload = json_decode(json: $row['payload'], associative: true) ?? [];
        $userId = $this->extractUserId(payload: $payload);
        $user = $this->resolveUser(userId: $userId);

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
    }

    private function resolveUser(string $userId): DomainEventLogUserResult
    {
        if ('' === $userId) {
            return new DomainEventLogUserResult(
                id: '',
                username: '',
                name: '',
                lastname: '',
            );
        }

        $row = $this->masterConnection->createQueryBuilder()
            ->select('u.id', 'u.username', 'u.name', 'u.lastname')
            ->from(table: 'user', alias: 'u')
            ->where('u.id = :id')
            ->setParameter(key: 'id', value: $userId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return new DomainEventLogUserResult(
                id: $userId,
                username: '',
                name: '',
                lastname: '',
            );
        }

        return new DomainEventLogUserResult(
            id: $row['id'],
            username: $row['username'],
            name: $row['name'],
            lastname: $row['lastname'],
        );
    }

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
