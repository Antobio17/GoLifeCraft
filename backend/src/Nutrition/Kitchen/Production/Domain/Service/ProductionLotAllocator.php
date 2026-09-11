<?php

namespace Nutrition\Kitchen\Production\Domain\Service;

interface ProductionLotAllocator
{
    public function findLotWithRoom(string $recipeId, float $servings, ?string $cookedOnOrBefore = null): ?string;
}
