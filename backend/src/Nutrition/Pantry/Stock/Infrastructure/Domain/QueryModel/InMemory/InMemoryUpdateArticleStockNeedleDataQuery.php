<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Catalog\Article\Domain\Model\ArticlePack;
use Nutrition\Pantry\Stock\Domain\QueryModel\UpdateArticleStockNeedleDataQuery;

final class InMemoryUpdateArticleStockNeedleDataQuery implements UpdateArticleStockNeedleDataQuery
{
    /**
     * @param string[]             $articleIds
     * @param array<string, float> $packSizes
     */
    public function __construct(
        private array $articleIds = [],
        private array $packSizes = [],
    ) {
    }

    public function findArticlePack(string $articleId): ?ArticlePack
    {
        if (!in_array($articleId, $this->articleIds, true)) {
            return null;
        }

        return ArticlePack::fromEquivalence(
            unit: isset($this->packSizes[$articleId]) ? 'pack' : null,
            size: $this->packSizes[$articleId] ?? null,
        );
    }
}
