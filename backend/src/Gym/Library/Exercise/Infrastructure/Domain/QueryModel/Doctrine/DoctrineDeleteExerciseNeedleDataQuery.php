<?php

namespace Gym\Library\Exercise\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Library\Exercise\Domain\QueryModel\DeleteExerciseNeedleDataQuery;

final readonly class DoctrineDeleteExerciseNeedleDataQuery implements DeleteExerciseNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function isReferenced(string $exerciseId): bool
    {
        if ($this->existsIn(table: 'session_exercise', exerciseId: $exerciseId)) {
            return true;
        }

        return $this->existsIn(table: 'workout_exercise', exerciseId: $exerciseId);
    }

    private function existsIn(string $table, string $exerciseId): bool
    {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: $table, alias: 't')
            ->where('t.exercise_id = :exerciseId')
            ->setParameter(key: 'exerciseId', value: $exerciseId)
            ->executeQuery()
            ->fetchOne() > 0;
    }
}
