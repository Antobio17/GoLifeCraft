<?php

namespace Gym\Analytics\Stats\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Analytics\Stats\Domain\QueryModel\Dto\GetGymStatsResult;
use Gym\Analytics\Stats\Domain\QueryModel\GetGymStatsNeedleDataQuery;

final readonly class DoctrineGetGymStatsNeedleDataQuery implements GetGymStatsNeedleDataQuery
{
    private const int SESSION_VOLUMES_LIMIT = 7;

    public function __construct(private Connection $connection)
    {
    }

    public function fetchStats(): GetGymStatsResult
    {
        $setAggregates = $this->connection->createQueryBuilder()
            ->select(
                'COUNT(es.id) AS total_sets',
                'COALESCE(SUM(es.reps * COALESCE(es.weight, 0)), 0) AS total_volume',
            )
            ->from(table: 'exercise_set', alias: 'es')
            ->executeQuery()
            ->fetchAssociative();

        return new GetGymStatsResult(
            totalSessions: $this->countTable(table: 'training_session'),
            totalExercises: $this->countTable(table: 'exercise'),
            totalSets: (int) ($setAggregates['total_sets'] ?? 0),
            totalVolumeKg: (float) ($setAggregates['total_volume'] ?? 0),
            totalPlannedMinutes: $this->totalPlannedMinutes(),
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

    private function totalPlannedMinutes(): int
    {
        return (int) $this->connection->createQueryBuilder()
            ->select('COALESCE(SUM(estimated_duration_minutes), 0)')
            ->from(table: 'training_session')
            ->executeQuery()
            ->fetchOne();
    }

    /**
     * @return array<int, array{id: string, name: string, exerciseCount: int, volumeKg: float}>
     */
    private function sessionVolumes(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                's.id AS id',
                's.name AS name',
                'COUNT(DISTINCT se.id) AS exercise_count',
                'COALESCE(SUM(es.reps * COALESCE(es.weight, 0)), 0) AS volume',
            )
            ->from(table: 'training_session', alias: 's')
            ->leftJoin('s', 'session_exercise', 'se', 'se.session_id = s.id')
            ->leftJoin('se', 'exercise_set', 'es', 'es.session_exercise_id = se.id')
            ->groupBy('s.id')
            ->addGroupBy('s.name')
            ->orderBy(sort: 'volume', order: 'DESC')
            ->addOrderBy(sort: 's.name', order: 'ASC')
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
                's.name AS name',
                'COALESCE(SUM(es.reps * COALESCE(es.weight, 0)), 0) AS volume',
            )
            ->from(table: 'training_session', alias: 's')
            ->leftJoin('s', 'session_exercise', 'se', 'se.session_id = s.id')
            ->leftJoin('se', 'exercise_set', 'es', 'es.session_exercise_id = se.id')
            ->groupBy('s.id')
            ->addGroupBy('s.name')
            ->addGroupBy('s.created_at')
            ->orderBy(sort: 's.created_at', order: 'ASC')
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
            ->select('e.muscle_groups AS muscle_groups', 'COUNT(es.id) AS set_count')
            ->from(table: 'session_exercise', alias: 'se')
            ->leftJoin('se', 'exercise', 'e', 'e.id = se.exercise_id')
            ->leftJoin('se', 'exercise_set', 'es', 'es.session_exercise_id = se.id')
            ->groupBy('se.id')
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
