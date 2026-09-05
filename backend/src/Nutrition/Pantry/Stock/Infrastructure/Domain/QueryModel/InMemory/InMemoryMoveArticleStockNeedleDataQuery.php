<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Stock\Domain\QueryModel\MoveArticleStockNeedleDataQuery;

final class InMemoryMoveArticleStockNeedleDataQuery implements MoveArticleStockNeedleDataQuery
{
    /**
     * @param string[] $articleIds
     * @param string[] $locationIds
     */
    public function __construct(
        private array $articleIds = [],
        private array $locationIds = [],
    ) {
    }

    public function articleExists(string $articleId): bool
    {
        return in_array(needle: $articleId, haystack: $this->articleIds, strict: true);
    }

    public function locationExists(string $locationId): bool
    {
        return in_array(needle: $locationId, haystack: $this->locationIds, strict: true);
    }
}
