<?php

namespace Nutrition\Diary\Diary\Domain\Model;

final readonly class DiaryLotComposition
{
    /**
     * A sub-recipe line carries the composition of the batch it was served from, when there was
     * one, so the whole chain of what was really cooked hangs from a single list.
     *
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string, composition?: array<int, array<string, mixed>>}> $ingredientsPerServing
     */
    public function __construct(
        public string $productionItemId,
        public string $recipeId,
        public array $ingredientsPerServing,
    ) {
    }

    /**
     * @return array<int, array{kind: string, refId: string, quantity: float, unit: ?string, composition?: array<int, array<string, mixed>>}>
     */
    public function scaledTo(float $servings): array
    {
        return array_map(static fn (array $ingredient): array => [
            ...$ingredient,
            'quantity' => $ingredient['quantity'] * $servings,
        ], $this->ingredientsPerServing);
    }
}
