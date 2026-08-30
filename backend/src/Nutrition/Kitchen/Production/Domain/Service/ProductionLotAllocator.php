<?php

namespace Nutrition\Kitchen\Production\Domain\Service;

interface ProductionLotAllocator
{
    /**
     * Oldest cooked batch of a recipe with enough servings still free to feed what is asked, so a
     * batch that consumes a sub-recipe eats the one that has been waiting the longest. Null when
     * nothing cooked can cover it. A day narrows it to batches cooked on or before it: nobody eats
     * from a pot that was not on the fire yet.
     */
    public function findLotWithRoom(string $recipeId, float $servings, ?string $cookedOnOrBefore = null): ?string;
}
