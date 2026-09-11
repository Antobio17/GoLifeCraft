<?php

namespace Nutrition\Diary\Diary\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryLotComposition;

interface DiaryLotCompositionProvider
{
    public function findComposition(string $productionItemId): ?DiaryLotComposition;
}
