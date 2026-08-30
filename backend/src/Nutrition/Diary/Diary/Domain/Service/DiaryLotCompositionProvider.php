<?php

namespace Nutrition\Diary\Diary\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryLotComposition;

interface DiaryLotCompositionProvider
{
    /**
     * What one serving of a cooked batch is made of. Null when the batch is gone or was never
     * cooked, which sends the entry back to counting its recipe.
     */
    public function findComposition(string $productionItemId): ?DiaryLotComposition;
}
