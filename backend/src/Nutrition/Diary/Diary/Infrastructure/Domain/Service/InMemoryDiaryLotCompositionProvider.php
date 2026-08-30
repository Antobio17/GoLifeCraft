<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryLotComposition;
use Nutrition\Diary\Diary\Domain\Service\DiaryLotCompositionProvider;

final class InMemoryDiaryLotCompositionProvider implements DiaryLotCompositionProvider
{
    /** @var array<string, DiaryLotComposition> */
    private array $compositions = [];

    /**
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string}> $ingredientsPerServing
     */
    public function withLot(string $productionItemId, string $recipeId, array $ingredientsPerServing): self
    {
        $this->compositions[$productionItemId] = new DiaryLotComposition(
            productionItemId: $productionItemId,
            recipeId: $recipeId,
            ingredientsPerServing: $ingredientsPerServing,
        );

        return $this;
    }

    public function findComposition(string $productionItemId): ?DiaryLotComposition
    {
        return $this->compositions[$productionItemId] ?? null;
    }
}
