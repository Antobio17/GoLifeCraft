<?php

namespace Gym\Training\Workout\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Domain\QueryModel\Dto\GetWorkoutsResult;
use Gym\Training\Workout\Domain\QueryModel\GetWorkoutsNeedleDataQuery;

final readonly class DoctrineGetWorkoutsNeedleDataQuery implements GetWorkoutsNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findWorkouts(
        int $pageSize,
        int $pageNumber,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery()->select(
            'w.id',
            'w.session_id',
            'w.session_name',
            'w.status',
            'w.started_at',
            'w.finished_at',
            'w.duration_seconds',
            'w.created_at',
            'w.updated_at',
            'w.created_by_user_id',
            'w.updated_by_user_id'
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
            workoutIds: array_column(array: $rows, column_key: 'id'),
        );
        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: function ($row) use ($summaries, $utc): GetWorkoutsResult {
            $summary = $summaries[$row['id']] ?? ['count' => 0, 'totalSets' => 0, 'completedSets' => 0, 'muscleGroups' => []];

            return new GetWorkoutsResult(
                id: $row['id'],
                aggregateName: 'Workout',
                sessionId: $row['session_id'],
                sessionName: $row['session_name'],
                status: $row['status'],
                startedAt: new \DateTime(datetime: $row['started_at'], timezone: $utc),
                finishedAt: null === $row['finished_at'] ? null : new \DateTime(datetime: $row['finished_at'], timezone: $utc),
                durationSeconds: (int) $row['duration_seconds'],
                exerciseCount: $summary['count'],
                totalSets: $summary['totalSets'],
                completedSets: $summary['completedSets'],
                muscleGroups: $summary['muscleGroups'],
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );
        }, array: $rows);
    }

    public function totalWorkouts(): int
    {
        return (int) $this->getBaseQuery()
            ->select('COUNT(*)')
            ->executeQuery()
            ->fetchOne();
    }

    private function exercisesSummary(array $workoutIds): array
    {
        $exerciseRows = $this->connection->createQueryBuilder()
            ->select('we.id', 'we.workout_id', 'we.muscle_groups')
            ->from(table: 'workout_exercise', alias: 'we')
            ->where('we.workout_id IN (:workoutIds)')
            ->setParameter(
                key: 'workoutIds',
                value: $workoutIds,
                type: ArrayParameterType::STRING,
            )
            ->executeQuery()
            ->fetchAllAssociative();

        if ([] === $exerciseRows) {
            return [];
        }

        $exerciseToWorkout = [];
        $summaries = [];

        foreach ($exerciseRows as $row) {
            $workoutId = $row['workout_id'];
            $exerciseToWorkout[$row['id']] = $workoutId;
            $summaries[$workoutId] ??= ['count' => 0, 'totalSets' => 0, 'completedSets' => 0, 'muscleGroups' => []];
            ++$summaries[$workoutId]['count'];

            $muscleGroups = json_decode(json: $row['muscle_groups'] ?? '[]', associative: true) ?? [];
            foreach ($muscleGroups as $muscleGroup) {
                if (!in_array(needle: $muscleGroup, haystack: $summaries[$workoutId]['muscleGroups'], strict: true)) {
                    $summaries[$workoutId]['muscleGroups'][] = $muscleGroup;
                }
            }
        }

        $setRows = $this->connection->createQueryBuilder()
            ->select('ws.workout_exercise_id', 'ws.done')
            ->from(table: 'workout_set', alias: 'ws')
            ->where('ws.workout_exercise_id IN (:exerciseIds)')
            ->setParameter(
                key: 'exerciseIds',
                value: array_keys($exerciseToWorkout),
                type: ArrayParameterType::STRING,
            )
            ->executeQuery()
            ->fetchAllAssociative();

        foreach ($setRows as $row) {
            $workoutId = $exerciseToWorkout[$row['workout_exercise_id']] ?? null;
            if (null === $workoutId) {
                continue;
            }

            ++$summaries[$workoutId]['totalSets'];
            if ((bool) $row['done']) {
                ++$summaries[$workoutId]['completedSets'];
            }
        }

        return $summaries;
    }

    private function getBaseQuery(): QueryBuilder
    {
        return $this->connection->createQueryBuilder()
            ->from(table: 'training_workout', alias: 'w')
            ->where('w.status = :status')
            ->setParameter(key: 'status', value: Workout::STATUS_COMPLETED);
    }

    private function applyOrdering(QueryBuilder $qb, ?string $orderBy): void
    {
        $allowedFields = [
            'startedAt' => 'w.started_at',
            'finishedAt' => 'w.finished_at',
            'durationSeconds' => 'w.duration_seconds',
        ];

        if (null === $orderBy) {
            $qb->orderBy(sort: 'w.started_at', order: 'DESC');

            return;
        }

        $direction = 'ASC';
        $field = $orderBy;

        if (str_starts_with(haystack: $orderBy, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $orderBy, offset: 1);
        }

        if (!isset($allowedFields[$field])) {
            $qb->orderBy(sort: 'w.started_at', order: 'DESC');

            return;
        }

        $qb->orderBy(sort: $allowedFields[$field], order: $direction);
    }
}
