<?php

namespace Nutrition\Shopping\Shopping\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Shopping\Shopping\Domain\QueryModel\AddShoppingListItemNeedleDataQuery;

final class InMemoryAddShoppingListItemNeedleDataQuery implements AddShoppingListItemNeedleDataQuery
{
    /**
     * @param string[] $existingArticleIds
     * @param string[] $articleIdsInList
     */
    public function __construct(
        private array $existingArticleIds = [],
        private array $articleIdsInList = [],
    ) {
    }

    public function articleExists(string $articleId): bool
    {
        return in_array(needle: $articleId, haystack: $this->existingArticleIds, strict: true);
    }

    public function articleAlreadyInList(string $articleId): bool
    {
        return in_array(needle: $articleId, haystack: $this->articleIdsInList, strict: true);
    }
}
