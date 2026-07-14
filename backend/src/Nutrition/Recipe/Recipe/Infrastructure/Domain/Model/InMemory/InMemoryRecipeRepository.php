<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\Model\InMemory;

use Nutrition\Recipe\Recipe\Domain\Model\Recipe;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeRepository;

final class InMemoryRecipeRepository implements RecipeRepository
{
    private array $recipes = [];

    public function nextId(): string
    {
        return 'recipe-'.(count(value: $this->recipes) + 1);
    }

    public function findById(string $id): ?Recipe
    {
        foreach ($this->recipes as $recipe) {
            if ($recipe->id === $id) {
                return $recipe;
            }
        }

        return null;
    }

    public function save(Recipe $recipe): void
    {
        foreach ($this->recipes as $key => $existing) {
            if ($existing->id === $recipe->id) {
                $this->recipes[$key] = $recipe;

                return;
            }
        }

        $this->recipes[] = $recipe;
    }

    public function delete(Recipe $recipe): void
    {
        foreach ($this->recipes as $key => $existing) {
            if ($existing->id === $recipe->id) {
                unset($this->recipes[$key]);
                break;
            }
        }
    }
}
