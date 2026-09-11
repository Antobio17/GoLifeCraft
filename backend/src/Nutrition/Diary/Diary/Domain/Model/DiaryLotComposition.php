<?php

namespace Nutrition\Diary\Diary\Domain\Model;

final readonly class DiaryLotComposition
{
    /**
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
