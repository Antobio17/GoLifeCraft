<?php

namespace Gym\Training\Session\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Gym\Training\Session\Domain\QueryModel\Dto\GetSessionsResult;
use Gym\Training\Session\Domain\QueryModel\GetSessionsNeedleDataQuery;

final readonly class DoctrineGetSessionsNeedleDataQuery implements GetSessionsNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findSessions(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery(filterName: $filterName)->select(
            's.id',
            's.name',
            's.estimated_duration_minutes',
            's.created_at',
            's.updated_at',
            's.created_by_user_id',
            's.updated_by_user_id'
        );

        $this->applyOrdering(qb: $qb, orderBy: $orderBy);

        $rows = $qb->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        if ([] === $rows) {
            return [];
        }

        $summaries = $this->exercisesSummary(
            sessionIds: array_column(array: $rows, column_key: 'id'),
        );
        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: function ($row) use ($summaries, $utc): GetSessionsResult {
            $summary = $summaries[$row['id']] ?? ['count' => 0, 'muscleGroups' => []];

            return new GetSessionsResult(
                id: $row['id'],
                aggregateName: 'Session',
                name: $row['name'],
                estimatedDurationMinutes: (int) $row['estimated_duration_minutes'],
                exerciseCount: $summary['count'],
                muscleGroups: $summary['muscleGroups'],
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );
        }, array: $rows);
    }

    public function totalSessions(?string $filterName = null): int
    {
        return (int) $this->getBaseQuery(filterName: $filterName)
            ->select('COUNT(*)')
            ->executeQuery()
            ->fetchOne();
    }

    private function exercisesSummary(array $sessionIds): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('se.session_id', 'se.muscle_groups')
            ->from(table: 'session_exercise', alias: 'se')
            ->where('se.session_id IN (:sessionIds)')
            ->setParameter(
                key: 'sessionIds',
                value: $sessionIds,
                type: ArrayParameterType::STRING,
            )
            ->executeQuery()
            ->fetchAllAssociative();

        $summaries = [];

        foreach ($rows as $row) {
            $sessionId = $row['session_id'];
            $summaries[$sessionId] ??= ['count' => 0, 'muscleGroups' => []];
            ++$summaries[$sessionId]['count'];

            $muscleGroups = json_decode(json: $row['muscle_groups'] ?? '[]', associative: true) ?? [];
            foreach ($muscleGroups as $muscleGroup) {
                if (!in_array(needle: $muscleGroup, haystack: $summaries[$sessionId]['muscleGroups'], strict: true)) {
                    $summaries[$sessionId]['muscleGroups'][] = $muscleGroup;
                }
            }
        }

        return $summaries;
    }

    private function getBaseQuery(?string $filterName): QueryBuilder
    {
        $qb = $this->connection->createQueryBuilder()->from(table: 'training_session', alias: 's');

        if (null !== $filterName) {
            $qb->andWhere('s.name LIKE :name')
                ->setParameter(key: 'name', value: '%'.$filterName.'%');
        }

        return $qb;
    }

    private function applyOrdering(QueryBuilder $qb, ?string $orderBy): void
    {
        $allowedFields = [
            'name' => 's.name',
            'createdAt' => 's.created_at',
            'updatedAt' => 's.updated_at',
        ];

        if (null === $orderBy) {
            $qb->orderBy(sort: 's.created_at', order: 'DESC');

            return;
        }

        $direction = 'ASC';
        $field = $orderBy;

        if (str_starts_with(haystack: $orderBy, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $orderBy, offset: 1);
        }

        if (!isset($allowedFields[$field])) {
            $qb->orderBy(sort: 's.created_at', order: 'DESC');

            return;
        }

        $qb->orderBy(sort: $allowedFields[$field], order: $direction);
    }
}
