<?php

namespace Gym\Analytics\Stats\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetExerciseStatsResult;
use Gym\Analytics\Stats\Domain\QueryModel\GetExerciseStatsNeedleDataQuery;

final readonly class DoctrineGetExerciseStatsNeedleDataQuery implements GetExerciseStatsNeedleDataQuery
{
    private const string COMPLETED_STATUS = 'completed';

    public function __construct(private Connection $connection)
    {
    }

    public function fetchStats(string $exerciseId): GetExerciseStatsResult
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'tw.id AS workout_id',
                'tw.finished_at AS finished_at',
                'ws.reps AS reps',
                'ws.weight AS weight',
            )
            ->from(table: 'workout_set', alias: 'ws')
            ->innerJoin('ws', 'workout_exercise', 'we', 'we.id = ws.workout_exercise_id')
            ->innerJoin('we', 'training_workout', 'tw', 'tw.id = we.workout_id')
            ->where('we.exercise_id = :exerciseId')
            ->andWhere('tw.status = :status')
            ->andWhere('ws.done = 1')
            ->setParameter('exerciseId', $exerciseId)
            ->setParameter('status', self::COMPLETED_STATUS)
            ->orderBy(sort: 'tw.finished_at', order: 'ASC')
            ->addOrderBy(sort: 'ws.position', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        return new GetExerciseStatsResult(
            exerciseId: $exerciseId,
            sessions: $this->buildSessions(rows: $rows),
        );
    }

    /**
     * @param array<int, array{workout_id: string, finished_at: string, reps: int|string, weight: float|string|null}> $rows
     *
     * @return array<int, array{date: string, maxWeightKg: float, estimatedOneRepMaxKg: float, volumeKg: float, sets: array<int, array{reps: int, weightKg: float}>}>
     */
    private function buildSessions(array $rows): array
    {
        $grouped = [];

        foreach ($rows as $row) {
            $workoutId = $row['workout_id'];
            $grouped[$workoutId] ??= ['date' => $row['finished_at'], 'sets' => []];
            $grouped[$workoutId]['sets'][] = [
                'reps' => (int) $row['reps'],
                'weightKg' => (float) ($row['weight'] ?? 0),
            ];
        }

        return array_values(array_map(
            callback: static function (array $group): array {
                $maxWeight = 0.0;
                $estimatedOneRepMax = 0.0;
                $volume = 0.0;

                foreach ($group['sets'] as $set) {
                    $weight = $set['weightKg'];
                    $reps = $set['reps'];
                    $volume += $weight * $reps;
                    $maxWeight = max($maxWeight, $weight);
                    $estimatedOneRepMax = max($estimatedOneRepMax, $weight * (1 + $reps / 30));
                }

                return [
                    'date' => $group['date'],
                    'maxWeightKg' => round($maxWeight, 1),
                    'estimatedOneRepMaxKg' => round($estimatedOneRepMax, 1),
                    'volumeKg' => round($volume, 1),
                    'sets' => $group['sets'],
                ];
            },
            array: $grouped,
        ));
    }
}
