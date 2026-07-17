<?php

namespace Nutrition\Diary\Goal\Infrastructure\Domain\Model\InMemory;

use Nutrition\Diary\Goal\Domain\Model\DiaryGoalDay;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoalDayRepository;

final class InMemoryDiaryGoalDayRepository implements DiaryGoalDayRepository
{
    /** @var array<int, DiaryGoalDay> */
    private array $diaryGoalDays = [];

    public function nextId(): string
    {
        return 'diary-goal-day-'.(count(value: $this->diaryGoalDays) + 1);
    }

    public function existsForDate(string $entryDate): bool
    {
        foreach ($this->diaryGoalDays as $diaryGoalDay) {
            if ($diaryGoalDay->entryDate === $entryDate) {
                return true;
            }
        }

        return false;
    }

    public function findByDate(string $entryDate): ?DiaryGoalDay
    {
        foreach ($this->diaryGoalDays as $diaryGoalDay) {
            if ($diaryGoalDay->entryDate === $entryDate) {
                return $diaryGoalDay;
            }
        }

        return null;
    }

    public function save(DiaryGoalDay $diaryGoalDay): void
    {
        foreach ($this->diaryGoalDays as $key => $existing) {
            if ($existing->id === $diaryGoalDay->id) {
                $this->diaryGoalDays[$key] = $diaryGoalDay;

                return;
            }
        }

        $this->diaryGoalDays[] = $diaryGoalDay;
    }
}
