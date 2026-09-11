<?php

namespace Gym\Analytics\Stats\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetExerciseTopSetsResult;
use Gym\Analytics\Stats\Domain\QueryModel\GetExerciseTopSetsNeedleDataQuery;

final readonly class DoctrineGetExerciseTopSetsNeedleDataQuery implements GetExerciseTopSetsNeedleDataQuery
{
    private const string COMPLETED_STATUS = 'completed';

    public function __construct(private Connection $connection)
    {
    }

    /**
     * El orden decide el resultado: por ejercicio, primero el entreno más reciente y
     * dentro de él la serie con más peso, desempatando por repeticiones. La primera
     * fila de cada ejercicio es por tanto su serie de referencia.
     */
    public function fetchTopSets(array $exerciseIds): GetExerciseTopSetsResult
    {
        if ([] === $exerciseIds) {
            return new GetExerciseTopSetsResult(topSets: []);
        }

        $rows = $this->connection->createQueryBuilder()
            ->select(
                'we.exercise_id AS exercise_id',
                'tw.finished_at AS finished_at',
                'ws.reps AS reps',
                'COALESCE(ws.weight, 0) AS weight',
            )
            ->from(table: 'workout_set', alias: 'ws')
            ->innerJoin('ws', 'workout_exercise', 'we', 'we.id = ws.workout_exercise_id')
            ->innerJoin('we', 'training_workout', 'tw', 'tw.id = we.workout_id')
            ->where('we.exercise_id IN (:exerciseIds)')
            ->andWhere('tw.status = :status')
            ->andWhere('tw.finished_at IS NOT NULL')
            ->andWhere('ws.done = 1')
            ->setParameter(key: 'exerciseIds', value: $exerciseIds, type: ArrayParameterType::STRING)
            ->setParameter(key: 'status', value: self::COMPLETED_STATUS)
            ->orderBy(sort: 'we.exercise_id', order: 'ASC')
            ->addOrderBy(sort: 'tw.finished_at', order: 'DESC')
            ->addOrderBy(sort: 'weight', order: 'DESC')
            ->addOrderBy(sort: 'ws.reps', order: 'DESC')
            ->executeQuery()
            ->fetchAllAssociative();

        return new GetExerciseTopSetsResult(topSets: $this->buildTopSets(rows: $rows));
    }

    /**
     * @param array<int, array{exercise_id: string, finished_at: string, reps: int|string, weight: float|string}> $rows
     *
     * @return array<int, array{exerciseId: string, reps: int, weightKg: float, date: string}>
     */
    private function buildTopSets(array $rows): array
    {
        $topSets = [];

        foreach ($rows as $row) {
            $exerciseId = (string) $row['exercise_id'];
            $topSets[$exerciseId] ??= [
                'exerciseId' => $exerciseId,
                'reps' => (int) $row['reps'],
                'weightKg' => round(num: (float) $row['weight'], precision: 1),
                'date' => (string) $row['finished_at'],
            ];
        }

        return array_values(array: $topSets);
    }
}
