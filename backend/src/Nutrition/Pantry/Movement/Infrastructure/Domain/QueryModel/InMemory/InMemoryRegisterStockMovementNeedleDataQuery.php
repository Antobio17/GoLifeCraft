<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Pantry\Movement\Domain\QueryModel\RegisterStockMovementNeedleDataQuery;

final class InMemoryRegisterStockMovementNeedleDataQuery implements RegisterStockMovementNeedleDataQuery
{
    /**
     * @param string[] $articleIds
     * @param string[] $recipeIds
     */
    public function __construct(
        private array $articleIds = [],
        private array $recipeIds = [],
    ) {
    }

    public function referenceExists(string $kind, string $refId): bool
    {
        return in_array($refId, array_merge($this->articleIds, $this->recipeIds), true);
    }
}
