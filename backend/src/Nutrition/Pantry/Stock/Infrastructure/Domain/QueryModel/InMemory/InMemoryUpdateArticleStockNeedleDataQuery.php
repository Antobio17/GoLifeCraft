<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Stock\Domain\QueryModel\Dto\ArticleStockPolicy;
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

    public function findArticlePolicy(string $articleId): ?ArticleStockPolicy
    {
        if (!in_array($articleId, $this->articleIds, true)) {
            return null;
        }

        return new ArticleStockPolicy(
            articleId: $articleId,
            packUnit: isset($this->packSizes[$articleId]) ? 'pack' : null,
            packSize: $this->packSizes[$articleId] ?? null,
        );
    }
}
