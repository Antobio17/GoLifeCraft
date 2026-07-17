<?php

namespace Nutrition\Diary\Goal\Infrastructure\Domain\Model\InMemory;

use Nutrition\Diary\Goal\Domain\Model\DiaryGoal;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoalRepository;

final class InMemoryDiaryGoalRepository implements DiaryGoalRepository
{
    private ?DiaryGoal $diaryGoal = null;

    public function findCurrent(): ?DiaryGoal
    {
        return $this->diaryGoal;
    }

    public function save(DiaryGoal $diaryGoal): void
    {
        $this->diaryGoal = $diaryGoal;
    }
}
