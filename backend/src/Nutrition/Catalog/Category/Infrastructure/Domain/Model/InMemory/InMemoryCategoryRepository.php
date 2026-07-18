<?php

namespace Nutrition\Catalog\Category\Infrastructure\Domain\Model\InMemory;

use Nutrition\Catalog\Category\Domain\Model\Category;
use Nutrition\Catalog\Category\Domain\Model\CategoryRepository;
use Ramsey\Uuid\Uuid;

final class InMemoryCategoryRepository implements CategoryRepository
{
    /** @var array<string, Category> */
    private array $categories = [];

    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByName(string $name): ?Category
    {
        foreach ($this->categories as $category) {
            if ($category->name === $name) {
                return $category;
            }
        }

        return null;
    }

    public function save(Category $category): void
    {
        $this->categories[$category->id] = $category;
    }
}
