<?php

namespace Nutrition\Pantry\Movement\Domain\Model;

interface StockMovementRepository
{
    public function nextId(): string;

    public function findBySource(string $kind, string $refId, string $sourceKind, string $sourceId): ?StockMovement;

    /**
     * @return StockMovement[]
     */
    public function findAllBySource(string $sourceKind, string $sourceId): array;

    /**
     * @return StockMovement[]
     */
    public function findAllByReference(string $kind, string $refId): array;

    public function save(StockMovement $stockMovement): void;

    public function delete(StockMovement $stockMovement): void;
}
