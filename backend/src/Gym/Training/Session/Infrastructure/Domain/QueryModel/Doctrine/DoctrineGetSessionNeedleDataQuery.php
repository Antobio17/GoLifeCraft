<?php

namespace Gym\Training\Session\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Gym\Training\Session\Domain\QueryModel\Dto\ExerciseSetView;
use Gym\Training\Session\Domain\QueryModel\Dto\GetSessionResult;
use Gym\Training\Session\Domain\QueryModel\Dto\SessionExerciseView;
use Gym\Training\Session\Domain\QueryModel\GetSessionNeedleDataQuery;

final readonly class DoctrineGetSessionNeedleDataQuery implements GetSessionNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findSessionById(string $sessionId): ?GetSessionResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                's.id',
                's.name',
                's.estimated_duration_minutes',
                's.created_at',
                's.updated_at',
                's.created_by_user_id',
                's.updated_by_user_id'
            )
            ->from(table: 'training_session', alias: 's')
            ->where('s.id = :id')
            ->setParameter(key: 'id', value: $sessionId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetSessionResult(
            id: $row['id'],
            aggregateName: 'Session',
            name: $row['name'],
            estimatedDurationMinutes: (int) $row['estimated_duration_minutes'],
            exercises: $this->exercises(sessionId: $sessionId),
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    private function exercises(string $sessionId): array
    {
        $exerciseRows = $this->connection->createQueryBuilder()
            ->select(
                'se.id',
                'se.exercise_id',
                'e.name AS exercise_name',
                'e.muscle_groups',
                'e.type',
                'se.position',
                'se.note'
            )
            ->from(table: 'session_exercise', alias: 'se')
            ->leftJoin('se', 'exercise', 'e', 'e.id = se.exercise_id')
            ->where('se.session_id = :sessionId')
            ->setParameter(key: 'sessionId', value: $sessionId)
            ->orderBy('se.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        if ([] === $exerciseRows) {
            return [];
        }

        $setsByExercise = $this->setsByExercise(
            sessionExerciseIds: array_column(array: $exerciseRows, column_key: 'id'),
        );

        return array_map(callback: static function ($row) use ($setsByExercise): SessionExerciseView {
            return new SessionExerciseView(
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

    private function setsByExercise(array $sessionExerciseIds): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('es.id', 'es.session_exercise_id', 'es.position', 'es.reps', 'es.weight')
            ->from(table: 'exercise_set', alias: 'es')
            ->where('es.session_exercise_id IN (:ids)')
            ->setParameter(
                key: 'ids',
                value: $sessionExerciseIds,
                type: ArrayParameterType::STRING,
            )
            ->orderBy('es.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $setsByExercise = [];

        foreach ($rows as $row) {
            $setsByExercise[$row['session_exercise_id']][] = new ExerciseSetView(
                id: $row['id'],
                position: (int) $row['position'],
                reps: (int) $row['reps'],
                weight: null === $row['weight'] ? null : (float) $row['weight'],
            );
        }

        return $setsByExercise;
    }
}
