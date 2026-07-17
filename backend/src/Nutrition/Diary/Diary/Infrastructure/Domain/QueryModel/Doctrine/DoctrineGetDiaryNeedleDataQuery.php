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
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeNutritionCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final readonly class DoctrineGetDiaryNeedleDataQuery implements GetDiaryNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private RecipeNutritionCalculator $calculator,
    ) {
    }

    public function findDiaryDay(string $date): GetDiaryResult
    {
        $rows = $this->fetchEntries(date: $date);
        $graph = $this->graphProvider->load();
        $goals = $this->resolveGoals(date: $date);

        $meals = [];
        $totals = MacroBreakdown::zero();

        foreach (DiaryEntry::MEALS as $mealKey) {
            $mealEntries = [];
            $mealTotals = MacroBreakdown::zero();

            foreach (array_filter($rows, static fn ($row): bool => $row['meal'] === $mealKey) as $row) {
                $macros = $this->calculator->ingredientContribution(
                    graph: $graph,
                    kind: $row['kind'],
                    refId: $row['ref_id'],
                    quantity: (float) $row['quantity'],
                );

                $mealTotals = $mealTotals->add(other: $macros);

                $mealEntries[] = new DiaryEntryView(
                    id: $row['id'],
                    kind: $row['kind'],
                    refId: $row['ref_id'],
                    name: $this->resolveName(graph: $graph, kind: $row['kind'], refId: $row['ref_id']),
                    emoji: $this->resolveEmoji(graph: $graph, kind: $row['kind'], refId: $row['ref_id']),
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
            ->select('e.id', 'e.meal', 'e.kind', 'e.ref_id', 'e.quantity')
            ->from(table: 'diary_entry', alias: 'e')
            ->where('e.entry_date = :date')
            ->setParameter(key: 'date', value: $date)
            ->orderBy('e.created_at', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();
    }

    private function resolveName(RecipeNutritionGraph $graph, string $kind, string $refId): string
    {
        $name = DiaryEntry::KIND_PRODUCT === $kind
            ? $graph->articleName(articleId: $refId)
            : $graph->recipeName(recipeId: $refId);

        return $name ?? '(eliminado)';
    }

    private function resolveEmoji(RecipeNutritionGraph $graph, string $kind, string $refId): string
    {
        return DiaryEntry::KIND_PRODUCT === $kind
            ? $graph->articleEmoji(articleId: $refId)
            : $graph->recipeEmoji(recipeId: $refId);
    }
}
