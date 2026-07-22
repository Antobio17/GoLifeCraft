<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\Service;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Domain\Service\DiaryEntrySnapshotCalculator;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final class InMemoryDiaryEntrySnapshotCalculator implements DiaryEntrySnapshotCalculator
{
    /** @var array<string, DiaryEntrySnapshot> */
    private array $snapshotByRefId = [];

    public function setSnapshot(string $refId, DiaryEntrySnapshot $snapshot): void
    {
        $this->snapshotByRefId[$refId] = $snapshot;
    }

    public function calculate(string $kind, string $refId, float $quantity): DiaryEntrySnapshot
    {
        return $this->snapshotByRefId[$refId] ?? new DiaryEntrySnapshot(name: '', emoji: '', macros: MacroBreakdown::zero());
    }
}
