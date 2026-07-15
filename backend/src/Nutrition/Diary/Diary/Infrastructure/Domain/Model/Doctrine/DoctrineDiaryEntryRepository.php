<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineDiaryEntryRepository extends EntityRepository implements DiaryEntryRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?DiaryEntry
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('diaryEntry')
            ->from(from: DiaryEntry::class, alias: 'diaryEntry')
            ->where('diaryEntry.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(DiaryEntry $diaryEntry): void
    {
        $this->getEntityManager()->persist(object: $diaryEntry);
    }

    public function delete(DiaryEntry $diaryEntry): void
    {
        $this->getEntityManager()->remove(object: $diaryEntry);
    }
}
