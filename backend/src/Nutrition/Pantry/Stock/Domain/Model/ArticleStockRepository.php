<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

interface ArticleStockRepository
{
    public function nextId(): string;

    public function findByArticleId(string $articleId): ?ArticleStock;

    /**
     * @return ArticleStock[]
     */
    public function findByLocationId(string $locationId): array;

    public function save(ArticleStock $articleStock): void;

    public function delete(ArticleStock $articleStock): void;
}
