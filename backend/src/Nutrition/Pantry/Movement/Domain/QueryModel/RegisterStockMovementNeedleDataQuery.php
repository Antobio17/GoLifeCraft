<?php

namespace Nutrition\Pantry\Movement\Domain\QueryModel;

interface RegisterStockMovementNeedleDataQuery
{
    public function referenceExists(string $kind, string $refId): bool;
}
