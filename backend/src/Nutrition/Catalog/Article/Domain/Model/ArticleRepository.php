<?php

namespace Nutrition\Catalog\Article\Domain\Model;

use Nutrition\Catalog\NutritionFacts\Domain\Model\NutritionFacts;

interface ArticleRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Article;

    public function save(Article $article): void;

    public function delete(Article $article): void;

    public function findNutritionFactsById(string $nutritionFactsId): ?NutritionFacts;

    public function saveNutritionFacts(NutritionFacts $nutritionFacts): void;
}
