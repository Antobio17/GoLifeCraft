<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\QueryModel\ConsumePastDiaryEntriesNeedleDataQuery;

final class InMemoryConsumePastDiaryEntriesNeedleDataQuery implements ConsumePastDiaryEntriesNeedleDataQuery
{
    /**
     * @param DiaryEntry[] $entries
     */
    public function __construct(private array $entries = [])
    {
    }

    public function findPendingEntryIds(string $fromDate, string $toDate): array
    {
        $pending = array_filter(
            $this->entries,
            static fn (DiaryEntry $entry): bool => !$entry->consumed
                && $entry->entryDate >= $fromDate
                && $entry->entryDate <= $toDate,
        );

        usort($pending, static fn (DiaryEntry $a, DiaryEntry $b): int => $a->entryDate <=> $b->entryDate);

        return array_map(static fn (DiaryEntry $entry): string => $entry->id, $pending);
    }
}
