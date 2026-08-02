<?php

namespace Gym\Analytics\Stats\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetGymStatsResult;
use Gym\Analytics\Stats\Domain\QueryModel\GetGymStatsNeedleDataQuery;

final readonly class DoctrineGetGymStatsNeedleDataQuery implements GetGymStatsNeedleDataQuery
{
    private const int ACTIVITY_DAYS = 371;
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
            trainingDays: $this->trainingDays(),
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
     * @return array<int, array{date: string, workouts: int, volumeKg: float, minutes: int}>
     */
    private function trainingDays(): array
    {
        $from = (new \DateTimeImmutable(datetime: 'today'))
            ->modify(modifier: '-'.(self::ACTIVITY_DAYS - 1).' days')
            ->format(format: 'Y-m-d 00:00:00');

        $rows = $this->connection->createQueryBuilder()
            ->select(
                'DATE(tw.finished_at) AS day',
                'COUNT(*) AS workouts',
                'COALESCE(SUM(tw.duration_seconds), 0) AS seconds',
            )
            ->from(table: 'training_workout', alias: 'tw')
            ->where('tw.status = :status')
            ->andWhere('tw.finished_at >= :from')
            ->setParameter('status', self::COMPLETED_STATUS)
            ->setParameter('from', $from)
            ->groupBy('day')
            ->orderBy(sort: 'day', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $volumeByDay = $this->volumeByDay(from: $from);

        return array_map(callback: static fn (array $row): array => [
            'date' => (string) $row['day'],
            'workouts' => (int) $row['workouts'],
            'volumeKg' => (float) ($volumeByDay[(string) $row['day']] ?? 0),
            'minutes' => intdiv((int) $row['seconds'], 60),
        ], array: $rows);
    }

    /**
     * @return array<string, float>
     */
    private function volumeByDay(string $from): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'DATE(tw.finished_at) AS day',
                'COALESCE(SUM(ws.reps * COALESCE(ws.weight, 0)), 0) AS volume',
            )
            ->from(table: 'training_workout', alias: 'tw')
            ->innerJoin('tw', 'workout_exercise', 'we', 'we.workout_id = tw.id')
            ->innerJoin('we', 'workout_set', 'ws', 'ws.workout_exercise_id = we.id AND ws.done = 1')
            ->where('tw.status = :status')
            ->andWhere('tw.finished_at >= :from')
            ->setParameter('status', self::COMPLETED_STATUS)
            ->setParameter('from', $from)
            ->groupBy('day')
            ->executeQuery()
            ->fetchAllAssociative();

        $volumes = [];

        foreach ($rows as $row) {
            $volumes[(string) $row['day']] = (float) $row['volume'];
        }

        return $volumes;
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
