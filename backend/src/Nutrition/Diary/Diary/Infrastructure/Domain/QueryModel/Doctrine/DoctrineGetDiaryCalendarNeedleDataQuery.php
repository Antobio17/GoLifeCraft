<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryCalendarDay;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryCalendarResult;
use Nutrition\Diary\Diary\Domain\QueryModel\GetDiaryCalendarNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeNutritionCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final readonly class DoctrineGetDiaryCalendarNeedleDataQuery implements GetDiaryCalendarNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private RecipeNutritionCalculator $calculator,
    ) {
    }

    public function findMonthStatuses(string $month): GetDiaryCalendarResult
    {
        [$year, $monthNumber] = $this->parseMonth(month: $month);
        $firstDay = sprintf('%04d-%02d-01', $year, $monthNumber);
        $lastDay = (new \DateTimeImmutable(datetime: $firstDay))
            ->modify(modifier: 'last day of this month')
            ->format(format: 'Y-m-d');

        $rows = $this->fetchEntries(firstDay: $firstDay, lastDay: $lastDay);
        if ([] === $rows) {
            return new GetDiaryCalendarResult(
                id: $month,
                aggregateName: 'DiaryCalendar',
                month: $month,
                days: [],
            );
        }

        $graph = $this->graphProvider->load();
        $snapshots = $this->fetchGoalSnapshots(firstDay: $firstDay, lastDay: $lastDay);
        $currentGoalCalories = $this->currentGoalCalories();
        $today = $this->today();

        $consumedByDate = [];
        $countByDate = [];

        foreach ($rows as $row) {
            $date = $row['entry_date'];
            $macros = $this->calculator->ingredientContribution(
                graph: $graph,
                kind: $row['kind'],
                refId: $row['ref_id'],
                quantity: (float) $row['quantity'],
            );

            $consumedByDate[$date] = ($consumedByDate[$date] ?? 0.0) + $macros->calories;
            $countByDate[$date] = ($countByDate[$date] ?? 0) + 1;
        }

        $days = [];
        foreach ($consumedByDate as $date => $consumed) {
            $goalCalories = $this->goalCaloriesFor(
                date: $date,
                today: $today,
                snapshots: $snapshots,
                currentGoalCalories: $currentGoalCalories,
            );
            $ratio = $goalCalories > 0 ? $consumed / $goalCalories : 0.0;

            $days[] = new DiaryCalendarDay(
                date: $date,
                status: $this->statusForRatio(ratio: $ratio),
                percent: (int) round($ratio * 100),
                entryCount: $countByDate[$date],
            );
        }

        return new GetDiaryCalendarResult(
            id: $month,
            aggregateName: 'DiaryCalendar',
            month: $month,
            days: $days,
        );
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function parseMonth(string $month): array
    {
        if (1 === preg_match(pattern: '/^(\d{4})-(\d{2})$/', subject: $month, matches: $matches)) {
            return [(int) $matches[1], (int) $matches[2]];
        }

        $now = new \DateTimeImmutable(datetime: 'now', timezone: new \DateTimeZone(timezone: 'Europe/Madrid'));

        return [(int) $now->format(format: 'Y'), (int) $now->format(format: 'm')];
    }

    private function statusForRatio(float $ratio): string
    {
        if ($ratio >= 0.9 && $ratio <= 1.1) {
            return DiaryCalendarDay::STATUS_GREEN;
        }

        if ($ratio >= 0.75 && $ratio <= 1.25) {
            return DiaryCalendarDay::STATUS_ORANGE;
        }

        return DiaryCalendarDay::STATUS_RED;
    }

    /**
     * @param array<string, float> $snapshots
     */
    private function goalCaloriesFor(string $date, string $today, array $snapshots, float $currentGoalCalories): float
    {
        if ($date < $today && isset($snapshots[$date])) {
            return $snapshots[$date];
        }

        return $currentGoalCalories;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchEntries(string $firstDay, string $lastDay): array
    {
        return $this->connection->createQueryBuilder()
            ->select('e.entry_date', 'e.kind', 'e.ref_id', 'e.quantity')
            ->from(table: 'diary_entry', alias: 'e')
            ->where('e.entry_date BETWEEN :first AND :last')
            ->setParameter(key: 'first', value: $firstDay)
            ->setParameter(key: 'last', value: $lastDay)
            ->executeQuery()
            ->fetchAllAssociative();
    }

    /**
     * @return array<string, float>
     */
    private function fetchGoalSnapshots(string $firstDay, string $lastDay): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('d.entry_date', 'd.calories')
            ->from(table: 'diary_goal_day', alias: 'd')
            ->where('d.entry_date BETWEEN :first AND :last')
            ->setParameter(key: 'first', value: $firstDay)
            ->setParameter(key: 'last', value: $lastDay)
            ->executeQuery()
            ->fetchAllAssociative();

        $snapshots = [];
        foreach ($rows as $row) {
            $snapshots[$row['entry_date']] = (float) $row['calories'];
        }

        return $snapshots;
    }

    private function currentGoalCalories(): float
    {
        $config = $this->connection->createQueryBuilder()
            ->select('g.calories')
            ->from(table: 'diary_goal', alias: 'g')
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false !== $config) {
            return (float) $config['calories'];
        }

        return 2100.0;
    }

    private function today(): string
    {
        return (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: 'Europe/Madrid')))
            ->format(format: 'Y-m-d');
    }
}
