<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\Service\InMemory;

use Nutrition\Pantry\Stock\Domain\Service\ArticleStockUnitConverter;

final class InMemoryArticleStockUnitConverter implements ArticleStockUnitConverter
{
    /**
     * @param array<string, array<string, float>> $factors
     */
    public function __construct(private array $factors = [])
    {
    }

    public function toBaseUnits(string $articleId, float $quantity, ?string $unit): float
    {
        if (null === $unit || '' === $unit) {
            return $quantity;
        }

        return $quantity * ($this->factors[$articleId][$unit] ?? 1.0);
    }
}
