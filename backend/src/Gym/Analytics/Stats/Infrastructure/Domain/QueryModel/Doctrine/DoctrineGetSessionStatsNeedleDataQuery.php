<?php

namespace Gym\Analytics\Stats\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetSessionStatsResult;
use Gym\Analytics\Stats\Domain\QueryModel\GetSessionStatsNeedleDataQuery;

final readonly class DoctrineGetSessionStatsNeedleDataQuery implements GetSessionStatsNeedleDataQuery
{
    private const string COMPLETED_STATUS = 'completed';

    public function __construct(private Connection $connection)
    {
    }

    public function fetchStats(string $sessionId): GetSessionStatsResult
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'tw.finished_at AS finished_at',
                'tw.duration_seconds AS duration_seconds',
                'COALESCE(SUM(ws.reps * COALESCE(ws.weight, 0)), 0) AS volume',
                'COALESCE(SUM(ws.reps), 0) AS reps',
                'COUNT(ws.id) AS sets',
            )
            ->from(table: 'training_workout', alias: 'tw')
            ->leftJoin('tw', 'workout_exercise', 'we', 'we.workout_id = tw.id')
            ->leftJoin('we', 'workout_set', 'ws', 'ws.workout_exercise_id = we.id AND ws.done = 1')
            ->where('tw.session_id = :sessionId')
            ->andWhere('tw.status = :status')
            ->andWhere('tw.finished_at IS NOT NULL')
            ->groupBy('tw.id')
            ->addGroupBy('tw.finished_at')
            ->addGroupBy('tw.duration_seconds')
            ->setParameter('sessionId', $sessionId)
            ->setParameter('status', self::COMPLETED_STATUS)
            ->orderBy(sort: 'tw.finished_at', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        return new GetSessionStatsResult(
            sessionId: $sessionId,
            workouts: $this->buildWorkouts(rows: $rows),
        );
    }

    /**
     * @param array<int, array{finished_at: string, duration_seconds: int|string, volume: float|string, reps: int|string, sets: int|string}> $rows
     *
     * @return array<int, array{date: string, volumeKg: float, reps: int, sets: int, durationSeconds: int}>
     */
    private function buildWorkouts(array $rows): array
    {
        return array_map(
            callback: static fn (array $row): array => [
                'date' => $row['finished_at'],
                'volumeKg' => round((float) $row['volume'], 1),
                'reps' => (int) $row['reps'],
                'sets' => (int) $row['sets'],
                'durationSeconds' => (int) $row['duration_seconds'],
            ],
            array: $rows,
        );
    }
}
