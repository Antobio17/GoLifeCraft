<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Stock\Domain\QueryModel\UpdateArticleStockNeedleDataQuery;

final class InMemoryUpdateArticleStockNeedleDataQuery implements UpdateArticleStockNeedleDataQuery
{
    /**
     * @param string[] $articleIds
     */
    public function __construct(private array $articleIds = [])
    {
    }

    public function articleExists(string $articleId): bool
    {
        return in_array($articleId, $this->articleIds, true);
    }
}
