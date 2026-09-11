<?php

namespace Nutrition\Kitchen\Production\Domain\Service;

use Nutrition\Kitchen\Production\Domain\Model\ProductionCompositionLine;

interface ProductionCompositionResolver
{
    /**
     * @return ProductionCompositionLine[]
     */
    public function fromRecipe(string $recipeId, float $servings): array;

    /**
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string}> $lines
     *
     * @return ProductionCompositionLine[]
     */
    public function fromLines(array $lines): array;
}
