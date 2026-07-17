<?php

namespace Nutrition\Diary\Goal\Domain\Model;

interface DiaryGoalDayRepository
{
    public function nextId(): string;

    public function existsForDate(string $entryDate): bool;

    public function findByDate(string $entryDate): ?DiaryGoalDay;

    public function save(DiaryGoalDay $diaryGoalDay): void;
}
