<?php

namespace Nutrition\Diary\Goal\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoal;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoalRepository;

final class DoctrineDiaryGoalRepository extends EntityRepository implements DiaryGoalRepository
{
    public function findCurrent(): ?DiaryGoal
    {
        return $this->getEntityManager()->find(className: DiaryGoal::class, id: DiaryGoal::SINGLETON_ID);
    }

    public function save(DiaryGoal $diaryGoal): void
    {
        $this->getEntityManager()->persist(object: $diaryGoal);
    }
}
