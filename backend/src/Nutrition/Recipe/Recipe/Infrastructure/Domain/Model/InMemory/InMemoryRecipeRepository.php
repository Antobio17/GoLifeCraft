<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\Model\InMemory;

use Nutrition\Recipe\Recipe\Domain\Model\Recipe;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeRepository;

final class InMemoryRecipeRepository implements RecipeRepository
{
    private array $recipes = [];
    private array $ingredients = [];
    private array $steps = [];

    public function nextId(): string
    {
        return 'recipe-'.(count(value: $this->recipes) + 1);
    }

    public function findById(string $id): ?Recipe
    {
        foreach ($this->recipes as $recipe) {
            if ($recipe->id === $id) {
                return $this->withChildren(recipe: $recipe);
            }
        }

        return null;
    }

    public function save(Recipe $recipe): void
    {
        $this->ingredients[$recipe->id] = $recipe->ingredients;
        $this->steps[$recipe->id] = $recipe->steps;

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
        unset($this->ingredients[$recipe->id], $this->steps[$recipe->id]);

        foreach ($this->recipes as $key => $existing) {
            if ($existing->id === $recipe->id) {
                unset($this->recipes[$key]);
                break;
            }
        }
    }

    private function withChildren(Recipe $recipe): Recipe
    {
        $recipe->ingredients = $this->ingredients[$recipe->id] ?? [];
        $recipe->steps = $this->steps[$recipe->id] ?? [];

        return $recipe;
    }
}
