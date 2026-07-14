<?php

namespace Nutrition\Recipe\Recipe\Domain\Model;

interface RecipeRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Recipe;

    public function save(Recipe $recipe): void;

    public function delete(Recipe $recipe): void;
}
