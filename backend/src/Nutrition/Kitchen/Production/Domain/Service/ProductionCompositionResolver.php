<?php

namespace Nutrition\Kitchen\Production\Domain\Service;

use Nutrition\Kitchen\Production\Domain\Model\ProductionCompositionLine;

interface ProductionCompositionResolver
{
    /**
     * The composition a recipe asks for, scaled to the given servings: what a batch is born with.
     *
     * @return ProductionCompositionLine[]
     */
    public function fromRecipe(string $recipeId, float $servings): array;

    /**
     * The composition the cook typed in, with every quantity resolved to the base unit the pantry
     * and the macros are counted in.
     *
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string}> $lines
     *
     * @return ProductionCompositionLine[]
     */
    public function fromLines(array $lines): array;
}
