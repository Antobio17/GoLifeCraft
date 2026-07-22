<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\RecipeNutritionGraph;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeNutritionCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;

final readonly class RecipeGraphDiaryEntrySnapshotCalculator implements DiaryEntrySnapshotCalculator
{
    private const string DELETED_NAME = '(eliminado)';

    public function __construct(
        private DoctrineRecipeNutritionGraphProvider $graphProvider,
        private RecipeNutritionCalculator $calculator,
    ) {
    }

    public function calculate(string $kind, string $refId, float $quantity): DiaryEntrySnapshot
    {
        $graph = $this->graphProvider->load();

        return new DiaryEntrySnapshot(
            name: $this->resolveName(graph: $graph, kind: $kind, refId: $refId),
            emoji: $this->resolveEmoji(graph: $graph, kind: $kind, refId: $refId),
            macros: $this->calculator->ingredientContribution(graph: $graph, kind: $kind, refId: $refId, quantity: $quantity),
        );
    }

    private function resolveName(RecipeNutritionGraph $graph, string $kind, string $refId): string
    {
        $name = DiaryEntry::KIND_PRODUCT === $kind
            ? $graph->articleName(articleId: $refId)
            : $graph->recipeName(recipeId: $refId);

        return $name ?? self::DELETED_NAME;
    }

    private function resolveEmoji(RecipeNutritionGraph $graph, string $kind, string $refId): string
    {
        return DiaryEntry::KIND_PRODUCT === $kind
            ? $graph->articleEmoji(articleId: $refId)
            : $graph->recipeEmoji(recipeId: $refId);
    }
}
