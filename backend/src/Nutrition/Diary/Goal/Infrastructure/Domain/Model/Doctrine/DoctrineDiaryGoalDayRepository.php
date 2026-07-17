<?php

namespace Nutrition\Diary\Goal\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoalDay;
use Nutrition\Diary\Goal\Domain\Model\DiaryGoalDayRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineDiaryGoalDayRepository extends EntityRepository implements DiaryGoalDayRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function existsForDate(string $entryDate): bool
    {
        $count = $this->getEntityManager()->createQueryBuilder()
            ->select('COUNT(goalDay.id)')
            ->from(from: DiaryGoalDay::class, alias: 'goalDay')
            ->where('goalDay.entryDate = :entryDate')
            ->setParameter(key: 'entryDate', value: $entryDate)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $count > 0;
    }

    public function save(DiaryGoalDay $diaryGoalDay): void
    {
        $this->getEntityManager()->persist(object: $diaryGoalDay);
    }
}
