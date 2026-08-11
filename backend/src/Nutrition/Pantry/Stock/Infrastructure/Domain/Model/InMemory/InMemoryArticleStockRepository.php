<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\Model\InMemory;

use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStockRepository;

final class InMemoryArticleStockRepository implements ArticleStockRepository
{
    /** @var ArticleStock[] */
    private array $stocks = [];

    public function nextId(): string
    {
        return 'article-stock-'.(count(value: $this->stocks) + 1);
    }

    public function findByArticleId(string $articleId): ?ArticleStock
    {
        foreach ($this->stocks as $stock) {
            if ($stock->articleId === $articleId) {
                return $stock;
            }
        }

        return null;
    }

    public function save(ArticleStock $articleStock): void
    {
        foreach ($this->stocks as $key => $existing) {
            if ($existing->id === $articleStock->id) {
                $this->stocks[$key] = $articleStock;

                return;
            }
        }

        $this->stocks[] = $articleStock;
    }

    public function delete(ArticleStock $articleStock): void
    {
        foreach ($this->stocks as $key => $existing) {
            if ($existing->id === $articleStock->id) {
                unset($this->stocks[$key]);

                return;
            }
        }
    }
}
