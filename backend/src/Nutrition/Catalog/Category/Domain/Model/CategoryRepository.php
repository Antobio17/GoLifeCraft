<?php

namespace Nutrition\Catalog\Category\Domain\Model;

interface CategoryRepository
{
    public function nextId(): string;

    public function findByName(string $name): ?Category;

    public function save(Category $category): void;
}
