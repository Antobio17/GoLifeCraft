<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Catalog\Article\Domain\QueryModel\CreateArticleNeedleDataQuery;

final class InMemoryCreateArticleNeedleDataQuery implements CreateArticleNeedleDataQuery
{
    private array $existingNames = [];

    public function addExistingName(string $name): void
    {
        $this->existingNames[] = $name;
    }

    public function articleWithNameAlreadyExists(
        string $name,
    ): bool {
        return in_array(needle: $name, haystack: $this->existingNames, strict: true);
    }
}
