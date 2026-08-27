<?php

namespace Nutrition\Pantry\RecipeStock\Infrastructure\Domain\Model\InMemory;

use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStock;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStockRepository;

final class InMemoryRecipeStockRepository implements RecipeStockRepository
{
    /** @var RecipeStock[] */
    private array $stocks = [];

    public function nextId(): string
    {
        return 'recipe-stock-'.(count(value: $this->stocks) + 1);
    }

    public function findByRecipeId(string $recipeId): ?RecipeStock
    {
        foreach ($this->stocks as $stock) {
            if ($stock->recipeId === $recipeId) {
                return $stock;
            }
        }

        return null;
    }

    public function save(RecipeStock $recipeStock): void
    {
        foreach ($this->stocks as $key => $existing) {
            if ($existing->id === $recipeStock->id) {
                $this->stocks[$key] = $recipeStock;

                return;
            }
        }

        $this->stocks[] = $recipeStock;
    }

    public function delete(RecipeStock $recipeStock): void
    {
        foreach ($this->stocks as $key => $existing) {
            if ($existing->id === $recipeStock->id) {
                unset($this->stocks[$key]);

                return;
            }
        }
    }
}
