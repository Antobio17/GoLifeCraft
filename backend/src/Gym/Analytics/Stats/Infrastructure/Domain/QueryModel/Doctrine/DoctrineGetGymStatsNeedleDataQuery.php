<?php

namespace Gym\Analytics\Stats\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetGymStatsResult;
use Gym\Analytics\Stats\Domain\QueryModel\GetGymStatsNeedleDataQuery;

final readonly class DoctrineGetGymStatsNeedleDataQuery implements GetGymStatsNeedleDataQuery
{
    private const int SESSION_VOLUMES_LIMIT = 7;
    private const string COMPLETED_STATUS = 'completed';

    public function __construct(private Connection $connection)
    {
    }

    public function fetchStats(): GetGymStatsResult
    {
        $setAggregates = $this->connection->createQueryBuilder()
            ->select(
                'COUNT(ws.id) AS total_sets',
                'COALESCE(SUM(ws.reps * COALESCE(ws.weight, 0)), 0) AS total_volume',
            )
            ->from(table: 'workout_set', alias: 'ws')
            ->innerJoin('ws', 'workout_exercise', 'we', 'we.id = ws.workout_exercise_id')
            ->innerJoin('we', 'training_workout', 'tw', 'tw.id = we.workout_id')
            ->where('tw.status = :status')
            ->andWhere('ws.done = 1')
            ->setParameter('status', self::COMPLETED_STATUS)
            ->executeQuery()
            ->fetchAssociative();

        return new GetGymStatsResult(
            totalSessions: $this->totalCompletedWorkouts(),
            totalExercises: $this->countTable(table: 'exercise'),
            totalSets: (int) ($setAggregates['total_sets'] ?? 0),
            totalVolumeKg: (float) ($setAggregates['total_volume'] ?? 0),
            totalPlannedMinutes: $this->totalTrainedMinutes(),
            sessionVolumes: $this->sessionVolumes(),
            muscleDistribution: $this->muscleDistribution(),
            volumeProgression: $this->volumeProgression(),
        );
    }

    private function countTable(string $table): int
    {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: $table)
            ->executeQuery()
            ->fetchOne();
    }

    private function totalCompletedWorkouts(): int
    {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'training_workout')
            ->where('status = :status')
            ->setParameter('status', self::COMPLETED_STATUS)
            ->executeQuery()
            ->fetchOne();
    }

    private function totalTrainedMinutes(): int
    {
        $seconds = (int) $this->connection->createQueryBuilder()
            ->select('COALESCE(SUM(duration_seconds), 0)')
            ->from(table: 'training_workout')
            ->where('status = :status')
            ->setParameter('status', self::COMPLETED_STATUS)
            ->executeQuery()
            ->fetchOne();

        return intdiv($seconds, 60);
    }

    /**
     * @return array<int, array{id: string, name: string, exerciseCount: int, volumeKg: float}>
     */
    private function sessionVolumes(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'tw.session_id AS id',
                'tw.session_name AS name',
                'COUNT(DISTINCT we.id) AS exercise_count',
                'COALESCE(SUM(ws.reps * COALESCE(ws.weight, 0)), 0) AS volume',
            )
            ->from(table: 'training_workout', alias: 'tw')
            ->leftJoin('tw', 'workout_exercise', 'we', 'we.workout_id = tw.id')
            ->leftJoin('we', 'workout_set', 'ws', 'ws.workout_exercise_id = we.id AND ws.done = 1')
            ->where('tw.status = :status')
            ->setParameter('status', self::COMPLETED_STATUS)
            ->groupBy('tw.session_id')
            ->addGroupBy('tw.session_name')
            ->orderBy(sort: 'volume', order: 'DESC')
            ->addOrderBy(sort: 'tw.session_name', order: 'ASC')
            ->setMaxResults(maxResults: self::SESSION_VOLUMES_LIMIT)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static fn (array $row): array => [
            'id' => $row['id'],
            'name' => $row['name'],
            'exerciseCount' => (int) $row['exercise_count'],
            'volumeKg' => (float) $row['volume'],
        ], array: $rows);
    }

    /**
     * @return array<int, array{name: string, volumeKg: float}>
     */
    private function volumeProgression(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'tw.session_name AS name',
                'COALESCE(SUM(ws.reps * COALESCE(ws.weight, 0)), 0) AS volume',
            )
            ->from(table: 'training_workout', alias: 'tw')
            ->leftJoin('tw', 'workout_exercise', 'we', 'we.workout_id = tw.id')
            ->leftJoin('we', 'workout_set', 'ws', 'ws.workout_exercise_id = we.id AND ws.done = 1')
            ->where('tw.status = :status')
            ->setParameter('status', self::COMPLETED_STATUS)
            ->groupBy('tw.id')
            ->addGroupBy('tw.session_name')
            ->addGroupBy('tw.finished_at')
            ->orderBy(sort: 'tw.finished_at', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $cumulative = 0.0;
        $progression = [];

        foreach ($rows as $row) {
            $cumulative += (float) $row['volume'];
            $progression[] = ['name' => $row['name'], 'volumeKg' => $cumulative];
        }

        return $progression;
    }

    /**
     * @return array<int, array{muscleGroup: string, sets: int}>
     */
    private function muscleDistribution(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('e.muscle_groups AS muscle_groups', 'COUNT(ws.id) AS set_count')
            ->from(table: 'workout_exercise', alias: 'we')
            ->innerJoin('we', 'training_workout', 'tw', 'tw.id = we.workout_id')
            ->leftJoin('we', 'exercise', 'e', 'e.id = we.exercise_id')
            ->leftJoin('we', 'workout_set', 'ws', 'ws.workout_exercise_id = we.id AND ws.done = 1')
            ->where('tw.status = :status')
            ->setParameter('status', self::COMPLETED_STATUS)
            ->groupBy('we.id')
            ->addGroupBy('e.muscle_groups')
            ->executeQuery()
            ->fetchAllAssociative();

        $totals = [];

        foreach ($rows as $row) {
            $setCount = (int) $row['set_count'];
            $muscleGroups = json_decode(json: (string) ($row['muscle_groups'] ?? '[]'), associative: true) ?? [];

            foreach ($muscleGroups as $muscleGroup) {
                $totals[$muscleGroup] = ($totals[$muscleGroup] ?? 0) + $setCount;
            }
        }

        arsort(array: $totals);

        $distribution = [];

        foreach ($totals as $muscleGroup => $sets) {
            $distribution[] = ['muscleGroup' => (string) $muscleGroup, 'sets' => $sets];
        }

        return $distribution;
    }
}
