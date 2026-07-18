<?php

namespace Nutrition\Catalog\Supermarket\Infrastructure\Domain\Model\InMemory;

use Nutrition\Catalog\Supermarket\Domain\Model\Supermarket;
use Nutrition\Catalog\Supermarket\Domain\Model\SupermarketRepository;
use Ramsey\Uuid\Uuid;

final class InMemorySupermarketRepository implements SupermarketRepository
{
    /** @var array<string, Supermarket> */
    private array $supermarkets = [];

    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByName(string $name): ?Supermarket
    {
        foreach ($this->supermarkets as $supermarket) {
            if ($supermarket->name === $name) {
                return $supermarket;
            }
        }

        return null;
    }

    public function save(Supermarket $supermarket): void
    {
        $this->supermarkets[$supermarket->id] = $supermarket;
    }
}
