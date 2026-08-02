<?php

namespace Nutrition\Shopping\Shopping\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Shopping\Shopping\Domain\QueryModel\AddShoppingListItemNeedleDataQuery;

final class InMemoryAddShoppingListItemNeedleDataQuery implements AddShoppingListItemNeedleDataQuery
{
    /**
     * @param string[] $existingArticleIds
     */
    public function __construct(
        private array $existingArticleIds = [],
    ) {
    }

    public function articleExists(string $articleId): bool
    {
        return in_array(needle: $articleId, haystack: $this->existingArticleIds, strict: true);
    }
}
