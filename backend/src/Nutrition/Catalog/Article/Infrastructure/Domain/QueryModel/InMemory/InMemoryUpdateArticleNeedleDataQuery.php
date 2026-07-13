<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Catalog\Article\Domain\QueryModel\UpdateArticleNeedleDataQuery;

final class InMemoryUpdateArticleNeedleDataQuery implements UpdateArticleNeedleDataQuery
{
    private array $existingNames = [];

    public function addExistingName(string $name): void
    {
        $this->existingNames[] = $name;
    }

    public function articleWithNameAlreadyExists(
        string $name,
        string $excludingArticleId,
    ): bool {
        return in_array(needle: $name, haystack: $this->existingNames, strict: true);
    }
}
