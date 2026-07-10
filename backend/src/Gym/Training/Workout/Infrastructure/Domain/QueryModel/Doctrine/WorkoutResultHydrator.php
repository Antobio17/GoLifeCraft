<?php

namespace Gym\Training\Workout\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Gym\Training\Workout\Domain\QueryModel\Dto\GetWorkoutResult;
use Gym\Training\Workout\Domain\QueryModel\Dto\WorkoutExerciseView;
use Gym\Training\Workout\Domain\QueryModel\Dto\WorkoutSetView;

final class WorkoutResultHydrator
{
    public static function hydrate(Connection $connection, array $row): GetWorkoutResult
    {
        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetWorkoutResult(
            id: $row['id'],
            aggregateName: 'Workout',
            sessionId: $row['session_id'],
            sessionName: $row['session_name'],
            status: $row['status'],
            startedAt: new \DateTime(datetime: $row['started_at'], timezone: $utc),
            finishedAt: null === $row['finished_at'] ? null : new \DateTime(datetime: $row['finished_at'], timezone: $utc),
            durationSeconds: (int) $row['duration_seconds'],
            exercises: self::exercises(connection: $connection, workoutId: $row['id']),
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    /**
     * @return WorkoutExerciseView[]
     */
    private static function exercises(Connection $connection, string $workoutId): array
    {
        $exerciseRows = $connection->createQueryBuilder()
            ->select(
                'we.id',
                'we.exercise_id',
                'e.name AS exercise_name',
                'e.muscle_groups',
                'e.type',
                'we.position',
                'we.note'
            )
            ->from(table: 'workout_exercise', alias: 'we')
            ->leftJoin('we', 'exercise', 'e', 'e.id = we.exercise_id')
            ->where('we.workout_id = :workoutId')
            ->setParameter(key: 'workoutId', value: $workoutId)
            ->orderBy('we.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        if ([] === $exerciseRows) {
            return [];
        }

        $setsByExercise = self::setsByExercise(
            connection: $connection,
            workoutExerciseIds: array_column(array: $exerciseRows, column_key: 'id'),
        );

        return array_map(callback: static function ($row) use ($setsByExercise): WorkoutExerciseView {
            return new WorkoutExerciseView(
                id: $row['id'],
                exerciseId: $row['exercise_id'],
                exerciseName: $row['exercise_name'],
                muscleGroups: json_decode(json: $row['muscle_groups'] ?? '[]', associative: true) ?? [],
                type: $row['type'],
                position: (int) $row['position'],
                note: $row['note'],
                sets: $setsByExercise[$row['id']] ?? [],
            );
        }, array: $exerciseRows);
    }

    /**
     * @return array<string, WorkoutSetView[]>
     */
    private static function setsByExercise(Connection $connection, array $workoutExerciseIds): array
    {
        $rows = $connection->createQueryBuilder()
            ->select('ws.id', 'ws.workout_exercise_id', 'ws.position', 'ws.reps', 'ws.weight', 'ws.done')
            ->from(table: 'workout_set', alias: 'ws')
            ->where('ws.workout_exercise_id IN (:ids)')
            ->setParameter(
                key: 'ids',
                value: $workoutExerciseIds,
                type: ArrayParameterType::STRING,
            )
            ->orderBy('ws.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $setsByExercise = [];

        foreach ($rows as $row) {
            $setsByExercise[$row['workout_exercise_id']][] = new WorkoutSetView(
                id: $row['id'],
                position: (int) $row['position'],
                reps: (int) $row['reps'],
                weight: null === $row['weight'] ? null : (float) $row['weight'],
                done: (bool) $row['done'],
            );
        }

        return $setsByExercise;
    }
}
