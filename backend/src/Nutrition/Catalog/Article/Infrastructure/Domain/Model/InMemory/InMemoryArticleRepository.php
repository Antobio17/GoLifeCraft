<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\Model\InMemory;

use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticleRepository;
use Nutrition\Catalog\NutritionFacts\Domain\Model\NutritionFacts;

final class InMemoryArticleRepository implements ArticleRepository
{
    private array $articles = [];
    private array $nutritionFacts = [];

    public function nextId(): string
    {
        return 'article-'.(count(value: $this->articles) + 1);
    }

    public function findById(string $id): ?Article
    {
        foreach ($this->articles as $article) {
            if ($article->id === $id) {
                return $article;
            }
        }

        return null;
    }

    public function save(Article $article): void
    {
        foreach ($this->articles as $key => $existing) {
            if ($existing->id === $article->id) {
                $this->articles[$key] = $article;

                return;
            }
        }

        $this->articles[] = $article;
    }

    public function delete(Article $article): void
    {
        foreach ($this->articles as $key => $existing) {
            if ($existing->id === $article->id) {
                unset($this->articles[$key]);
                break;
            }
        }

        if (null !== $article->nutritionFactsId) {
            unset($this->nutritionFacts[$article->nutritionFactsId]);
        }
    }

    public function findNutritionFactsById(string $nutritionFactsId): ?NutritionFacts
    {
        return $this->nutritionFacts[$nutritionFactsId] ?? null;
    }

    public function saveNutritionFacts(NutritionFacts $nutritionFacts): void
    {
        $this->nutritionFacts[$nutritionFacts->id] = $nutritionFacts;
    }
}
