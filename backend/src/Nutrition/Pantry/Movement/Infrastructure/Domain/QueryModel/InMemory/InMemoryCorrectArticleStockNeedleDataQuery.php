<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Movement\Domain\Model\ArticleStockReference;
use Nutrition\Pantry\Movement\Domain\QueryModel\CorrectArticleStockNeedleDataQuery;

final class InMemoryCorrectArticleStockNeedleDataQuery implements CorrectArticleStockNeedleDataQuery
{
    /**
     * @param array<string, ArticleStockReference> $references
     */
    public function __construct(private array $references = [])
    {
    }

    public function findArticleReference(string $articleId): ?ArticleStockReference
    {
        return $this->references[$articleId] ?? null;
    }
}
