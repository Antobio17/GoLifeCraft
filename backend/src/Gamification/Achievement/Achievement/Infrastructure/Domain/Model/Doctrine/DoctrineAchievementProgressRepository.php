<?php

namespace Gamification\Achievement\Achievement\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Gamification\Achievement\Achievement\Domain\Model\AchievementProgress;
use Gamification\Achievement\Achievement\Domain\Model\AchievementProgressRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineAchievementProgressRepository extends EntityRepository implements AchievementProgressRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByDefinitionKey(string $definitionKey): ?AchievementProgress
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('achievementProgress')
            ->from(from: AchievementProgress::class, alias: 'achievementProgress')
            ->where('achievementProgress.definitionKey = :definitionKey')
            ->setParameter(key: 'definitionKey', value: $definitionKey)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(AchievementProgress $achievementProgress): void
    {
        $this->getEntityManager()->persist(object: $achievementProgress);
    }

    public function delete(AchievementProgress $achievementProgress): void
    {
        $this->getEntityManager()->remove(object: $achievementProgress);
    }
}
