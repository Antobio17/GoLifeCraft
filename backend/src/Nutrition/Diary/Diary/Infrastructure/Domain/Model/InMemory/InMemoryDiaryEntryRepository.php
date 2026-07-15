<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\Model\InMemory;

use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;

final class InMemoryDiaryEntryRepository implements DiaryEntryRepository
{
    /** @var array<int, DiaryEntry> */
    private array $diaryEntries = [];

    public function nextId(): string
    {
        return 'diary-entry-'.(count(value: $this->diaryEntries) + 1);
    }

    public function findById(string $id): ?DiaryEntry
    {
        foreach ($this->diaryEntries as $diaryEntry) {
            if ($diaryEntry->id === $id) {
                return $diaryEntry;
            }
        }

        return null;
    }

    public function save(DiaryEntry $diaryEntry): void
    {
        foreach ($this->diaryEntries as $key => $existing) {
            if ($existing->id === $diaryEntry->id) {
                $this->diaryEntries[$key] = $diaryEntry;

                return;
            }
        }

        $this->diaryEntries[] = $diaryEntry;
    }

    public function delete(DiaryEntry $diaryEntry): void
    {
        foreach ($this->diaryEntries as $key => $existing) {
            if ($existing->id === $diaryEntry->id) {
                unset($this->diaryEntries[$key]);
                break;
            }
        }
    }
}
