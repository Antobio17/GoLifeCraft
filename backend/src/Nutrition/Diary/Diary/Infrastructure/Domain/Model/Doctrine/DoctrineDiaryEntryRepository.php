<?php

namespace Nutrition\Diary\Diary\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntryNode;
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
        $diaryEntry = $this->getEntityManager()->createQueryBuilder()
            ->select('diaryEntry')
            ->from(from: DiaryEntry::class, alias: 'diaryEntry')
            ->where('diaryEntry.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();

        if (null === $diaryEntry) {
            return null;
        }

        $diaryEntry->nodes = $this->findNodes(diaryEntryId: $id);

        return $diaryEntry;
    }

    public function save(DiaryEntry $diaryEntry): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeChildren(
            diaryEntryId: $diaryEntry->id,
            keptNodeIds: array_map(callback: static fn (DiaryEntryNode $node): string => $node->id, array: $diaryEntry->nodes),
        );
        $entityManager->persist(object: $diaryEntry);

        foreach ($diaryEntry->nodes as $node) {
            $entityManager->persist(object: $node);
        }
    }

    public function delete(DiaryEntry $diaryEntry): void
    {
        $this->removeChildren(diaryEntryId: $diaryEntry->id, keptNodeIds: []);
        $this->getEntityManager()->remove(object: $diaryEntry);
    }

    /**
     * @return DiaryEntryNode[]
     */
    private function findNodes(string $diaryEntryId): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('diaryEntryNode')
            ->from(from: DiaryEntryNode::class, alias: 'diaryEntryNode')
            ->where('diaryEntryNode.diaryEntryId = :diaryEntryId')
            ->setParameter(key: 'diaryEntryId', value: $diaryEntryId)
            ->orderBy('diaryEntryNode.depth', 'ASC')
            ->addOrderBy('diaryEntryNode.path', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @param array<int, string> $keptNodeIds
     */
    private function removeChildren(string $diaryEntryId, array $keptNodeIds): void
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: DiaryEntryNode::class, alias: 'diaryEntryNode')
            ->where('diaryEntryNode.diaryEntryId = :diaryEntryId')
            ->setParameter(key: 'diaryEntryId', value: $diaryEntryId);

        if ([] !== $keptNodeIds) {
            $queryBuilder->andWhere('diaryEntryNode.id NOT IN (:keptNodeIds)')
                ->setParameter(key: 'keptNodeIds', value: $keptNodeIds);
        }

        $queryBuilder->getQuery()->execute();
    }
}
