<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Catalog\Article\Domain\Model\ArticlePack;
use Nutrition\Pantry\Movement\Domain\QueryModel\CorrectArticleStockNeedleDataQuery;

final class InMemoryCorrectArticleStockNeedleDataQuery implements CorrectArticleStockNeedleDataQuery
{
    /**
     * @param array<string, ArticlePack> $packs
     */
    public function __construct(private array $packs = [])
    {
    }

    public function findArticlePack(string $articleId): ?ArticlePack
    {
        return $this->packs[$articleId] ?? null;
    }
}
