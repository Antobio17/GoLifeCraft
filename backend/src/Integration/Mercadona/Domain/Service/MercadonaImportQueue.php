<?php

namespace Integration\Mercadona\Domain\Service;

interface MercadonaImportQueue
{
    public function isInitialized(): bool;

    /**
     * @param int[] $subcategoryIds
     */
    public function initialize(array $subcategoryIds): void;

    public function reset(): void;

    public function peekSubcategory(): ?int;

    public function markSubcategoryScanned(int $subcategoryId): void;

    /**
     * @param int[] $productIds
     */
    public function enqueueProducts(array $productIds): void;

    public function peekProduct(): ?int;

    public function markProductProcessed(int $productId): void;

    public function pendingSubcategories(): int;

    public function pendingProducts(): int;
}
