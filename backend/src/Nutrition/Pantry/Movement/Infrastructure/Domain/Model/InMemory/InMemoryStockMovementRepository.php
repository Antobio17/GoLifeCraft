<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\Model\InMemory;

use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Model\StockMovementRepository;
use Ramsey\Uuid\Uuid;

final class InMemoryStockMovementRepository implements StockMovementRepository
{
    /** @var array<string, StockMovement> */
    private array $movements = [];

    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findBySource(string $kind, string $refId, string $sourceKind, string $sourceId): ?StockMovement
    {
        foreach ($this->movements as $movement) {
            if ($movement->kind === $kind && $movement->refId === $refId
                && $movement->sourceKind === $sourceKind && $movement->sourceId === $sourceId) {
                return $movement;
            }
        }

        return null;
    }

    public function findAllBySource(string $sourceKind, string $sourceId): array
    {
        return array_values(array: array_filter(
            array: $this->movements,
            callback: static fn (StockMovement $movement): bool => $movement->sourceKind === $sourceKind
                && $movement->sourceId === $sourceId,
        ));
    }

    public function findAllByReference(string $kind, string $refId): array
    {
        return array_values(array: array_filter(
            array: $this->movements,
            callback: static fn (StockMovement $movement): bool => $movement->kind === $kind
                && $movement->refId === $refId,
        ));
    }

    public function save(StockMovement $stockMovement): void
    {
        $this->movements[$stockMovement->id] = $stockMovement;
    }

    public function delete(StockMovement $stockMovement): void
    {
        unset($this->movements[$stockMovement->id]);
    }
}
