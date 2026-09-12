<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Domain\Service\InMemory;

use Nutrition\Pantry\Movement\Domain\Service\StockMovementUnitConverter;

final class InMemoryStockMovementUnitConverter implements StockMovementUnitConverter
{
    /** @var array<string, float> */
    private array $factors = [];

    public function toBaseUnits(string $articleId, float $quantity, ?string $unit): float
    {
        if (null === $unit || '' === $unit) {
            return $quantity;
        }

        return $quantity * ($this->factors[sprintf('%s:%s', $articleId, $unit)] ?? 1.0);
    }

    public function setFactor(string $articleId, string $unit, float $factor): void
    {
        $this->factors[sprintf('%s:%s', $articleId, $unit)] = $factor;
    }
}
