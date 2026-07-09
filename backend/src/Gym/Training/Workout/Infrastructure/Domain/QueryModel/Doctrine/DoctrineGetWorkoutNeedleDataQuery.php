<?php

namespace Gym\Training\Workout\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Training\Workout\Domain\QueryModel\Dto\GetWorkoutResult;
use Gym\Training\Workout\Domain\QueryModel\GetWorkoutNeedleDataQuery;

final readonly class DoctrineGetWorkoutNeedleDataQuery implements GetWorkoutNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findWorkoutById(string $workoutId): ?GetWorkoutResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
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
            )
            ->from(table: 'training_workout', alias: 'w')
            ->where('w.id = :id')
            ->setParameter(key: 'id', value: $workoutId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        return WorkoutResultHydrator::hydrate(connection: $this->connection, row: $row);
    }
}
