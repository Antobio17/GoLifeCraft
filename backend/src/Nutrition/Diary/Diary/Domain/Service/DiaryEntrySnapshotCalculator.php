<?php

namespace Nutrition\Diary\Diary\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;

interface DiaryEntrySnapshotCalculator
{
    public function calculate(string $kind, string $refId, float $quantity): DiaryEntrySnapshot;
}
