<?php

namespace Nutrition\Pantry\RecipeStock\Domain\Model;

interface RecipeStockRepository
{
    public function nextId(): string;

    public function findByRecipeId(string $recipeId): ?RecipeStock;

    public function save(RecipeStock $recipeStock): void;

    public function delete(RecipeStock $recipeStock): void;
}
