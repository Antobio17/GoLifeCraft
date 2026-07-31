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
        $session = $this->getEntityManager()->createQueryBuilder()
            ->select('session')
            ->from(from: Session::class, alias: 'session')
            ->where('session.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();

        if (null === $session) {
            return null;
        }

        $session->exercises = $this->findExercises(sessionId: $session->id);

        return $session;
    }

    /**
     * @return SessionExercise[]
     */
    private function findExercises(string $sessionId): array
    {
        $sessionExercises = $this->getEntityManager()->createQueryBuilder()
            ->select('sessionExercise')
            ->from(from: SessionExercise::class, alias: 'sessionExercise')
            ->where('sessionExercise.sessionId = :sessionId')
            ->setParameter(key: 'sessionId', value: $sessionId)
            ->orderBy('sessionExercise.position', 'ASC')
            ->getQuery()
            ->getResult();

        foreach ($sessionExercises as $sessionExercise) {
            $sessionExercise->sets = $this->findSets(sessionExerciseId: $sessionExercise->id);
        }

        return $sessionExercises;
    }

    /**
     * @return ExerciseSet[]
     */
    private function findSets(string $sessionExerciseId): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('exerciseSet')
            ->from(from: ExerciseSet::class, alias: 'exerciseSet')
            ->where('exerciseSet.sessionExerciseId = :sessionExerciseId')
            ->setParameter(key: 'sessionExerciseId', value: $sessionExerciseId)
            ->orderBy('exerciseSet.position', 'ASC')
            ->getQuery()
            ->getResult();
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
