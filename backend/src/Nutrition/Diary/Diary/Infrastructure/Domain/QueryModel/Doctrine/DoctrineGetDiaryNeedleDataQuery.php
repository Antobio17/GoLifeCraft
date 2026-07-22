<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryEntryView;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryGoals;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\DiaryMealView;
use Nutrition\Diary\Diary\Domain\QueryModel\Dto\GetDiaryResult;
use Nutrition\Diary\Diary\Domain\QueryModel\GetDiaryNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class DoctrineGetDiaryNeedleDataQuery implements GetDiaryNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function findDiaryDay(string $date): GetDiaryResult
    {
        $rows = $this->fetchEntries(date: $date);
        $goals = $this->resolveGoals(date: $date);

        $meals = [];
        $totals = MacroBreakdown::zero();

        foreach (DiaryEntry::MEALS as $mealKey) {
            $mealEntries = [];
            $mealTotals = MacroBreakdown::zero();

            foreach (array_filter($rows, static fn ($row): bool => $row['meal'] === $mealKey) as $row) {
                $macros = new MacroBreakdown(
                    calories: (float) $row['snapshot_calories'],
                    protein: (float) $row['snapshot_protein'],
                    fat: (float) $row['snapshot_fat'],
                    carbs: (float) $row['snapshot_carbs'],
                );

                $mealTotals = $mealTotals->add(other: $macros);

                $mealEntries[] = new DiaryEntryView(
                    id: $row['id'],
                    kind: $row['kind'],
                    refId: $row['ref_id'],
                    name: $row['snapshot_name'],
                    emoji: $row['snapshot_emoji'],
                    quantity: (float) $row['quantity'],
                    unit: DiaryEntry::KIND_PRODUCT === $row['kind'] ? 'g' : 'rac.',
                    macros: $macros->rounded(),
                );
            }

            $totals = $totals->add(other: $mealTotals);

            $meals[] = new DiaryMealView(
                key: $mealKey,
                entryCount: count($mealEntries),
                totals: $mealTotals->rounded(),
                entries: $mealEntries,
            );
        }

        $consumed = (int) round($totals->calories);
        $goalCalories = (int) round($goals->calories);
        $percent = $goalCalories > 0 ? min(100, (int) round($consumed / $goalCalories * 100)) : 0;

        return new GetDiaryResult(
            id: $date,
            aggregateName: 'Diary',
            date: $date,
            goals: $goals,
            totals: $totals->rounded(),
            entryCount: count($rows),
            consumedCalories: $consumed,
            goalCalories: $goalCalories,
            remainingCalories: max(0, $goalCalories - $consumed),
            percent: $percent,
            meals: $meals,
        );
    }

    private function resolveGoals(string $date): DiaryGoals
    {
        if ($date < $this->today()) {
            return $this->resolvePastDayGoals(date: $date);
        }

        return $this->resolveCurrentGoals();
    }

    private function resolvePastDayGoals(string $date): DiaryGoals
    {
        $snapshot = $this->connection->createQueryBuilder()
            ->select('d.calories', 'd.protein', 'd.fat', 'd.carbs')
            ->from(table: 'diary_goal_day', alias: 'd')
            ->where('d.entry_date = :date')
            ->setParameter(key: 'date', value: $date)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false !== $snapshot) {
            return $this->mapGoals(row: $snapshot);
        }

        return $this->resolveCurrentGoals();
    }

    private function resolveCurrentGoals(): DiaryGoals
    {
        $config = $this->connection->createQueryBuilder()
            ->select('g.calories', 'g.protein', 'g.fat', 'g.carbs')
            ->from(table: 'diary_goal', alias: 'g')
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false !== $config) {
            return $this->mapGoals(row: $config);
        }

        return DiaryGoals::default();
    }

    private function today(): string
    {
        return (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: 'Europe/Madrid')))
            ->format(format: 'Y-m-d');
    }

    /**
     * @param array<string, mixed> $row
     */
    private function mapGoals(array $row): DiaryGoals
    {
        return new DiaryGoals(
            calories: (float) $row['calories'],
            protein: (float) $row['protein'],
            fat: (float) $row['fat'],
            carbs: (float) $row['carbs'],
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchEntries(string $date): array
    {
        return $this->connection->createQueryBuilder()
            ->select('e.id', 'e.meal', 'e.kind', 'e.ref_id', 'e.quantity', 'e.snapshot_name', 'e.snapshot_emoji', 'e.snapshot_calories', 'e.snapshot_protein', 'e.snapshot_fat', 'e.snapshot_carbs')
            ->from(table: 'diary_entry', alias: 'e')
            ->where('e.entry_date = :date')
            ->setParameter(key: 'date', value: $date)
            ->orderBy('e.created_at', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();
    }
}
