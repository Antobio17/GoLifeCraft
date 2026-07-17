<?php

namespace Nutrition\Diary\Goal\Domain\Model;

interface DiaryGoalRepository
{
    public function findCurrent(): ?DiaryGoal;

    public function save(DiaryGoal $diaryGoal): void;
}
