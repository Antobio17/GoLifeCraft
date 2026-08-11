<?php

namespace Nutrition\Catalog\Supermarket\Domain\Model;

interface SupermarketRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Supermarket;

    public function findByName(string $name): ?Supermarket;

    public function save(Supermarket $supermarket): void;
}
