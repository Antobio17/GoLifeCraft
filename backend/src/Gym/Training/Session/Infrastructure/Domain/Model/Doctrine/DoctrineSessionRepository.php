<?php

namespace Gym\Training\Session\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Gym\Training\Session\Domain\Model\ExerciseSet;
use Gym\Training\Session\Domain\Model\Session;
use Gym\Training\Session\Domain\Model\SessionExercise;
use Gym\Training\Session\Domain\Model\SessionRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineSessionRepository extends EntityRepository implements SessionRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Session
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('session')
            ->from(from: Session::class, alias: 'session')
            ->where('session.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(Session $session): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeChildren(sessionId: $session->id);
        $entityManager->persist(object: $session);

        foreach ($session->exercises as $sessionExercise) {
            $entityManager->persist(object: $sessionExercise);

            foreach ($sessionExercise->sets as $exerciseSet) {
                $entityManager->persist(object: $exerciseSet);
            }
        }
    }

    public function delete(Session $session): void
    {
        $this->removeChildren(sessionId: $session->id);
        $this->getEntityManager()->remove(object: $session);
    }

    private function removeChildren(string $sessionId): void
    {
        $entityManager = $this->getEntityManager();

        $sessionExerciseIds = $entityManager->createQueryBuilder()
            ->select('sessionExercise.id')
            ->from(from: SessionExercise::class, alias: 'sessionExercise')
            ->where('sessionExercise.sessionId = :sessionId')
            ->setParameter(key: 'sessionId', value: $sessionId)
            ->getQuery()
            ->getSingleColumnResult();

        if ([] !== $sessionExerciseIds) {
            $entityManager->createQueryBuilder()
                ->delete(delete: ExerciseSet::class, alias: 'exerciseSet')
                ->where('exerciseSet.sessionExerciseId IN (:sessionExerciseIds)')
                ->setParameter(key: 'sessionExerciseIds', value: $sessionExerciseIds)
                ->getQuery()
                ->execute();
        }

        $entityManager->createQueryBuilder()
            ->delete(delete: SessionExercise::class, alias: 'sessionExercise')
            ->where('sessionExercise.sessionId = :sessionId')
            ->setParameter(key: 'sessionId', value: $sessionId)
            ->getQuery()
            ->execute();
    }
}
