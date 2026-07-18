<?php

namespace Nutrition\Catalog\Supermarket\Domain\Model;

interface SupermarketRepository
{
    public function nextId(): string;

    public function findByName(string $name): ?Supermarket;

    public function save(Supermarket $supermarket): void;
}
