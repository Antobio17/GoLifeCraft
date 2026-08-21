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

    /**
     * Reconciles children by id: a granular command mutates rows that Doctrine already manages,
     * so wiping them all would leave the managed entities without a row to update.
     */
    public function save(Session $session): void
    {
        $entityManager = $this->getEntityManager();
        $sessionExerciseIds = array_map(
            callback: static fn (SessionExercise $sessionExercise): string => $sessionExercise->id,
            array: $session->exercises,
        );

        $this->removeChildren(sessionId: $session->id, keptSessionExerciseIds: $sessionExerciseIds);
        $entityManager->persist(object: $session);

        foreach ($session->exercises as $sessionExercise) {
            $entityManager->persist(object: $sessionExercise);
            $this->removeSets(
                sessionExerciseId: $sessionExercise->id,
                keptSetIds: array_map(
                    callback: static fn (ExerciseSet $exerciseSet): string => $exerciseSet->id,
                    array: $sessionExercise->sets,
                ),
            );

            foreach ($sessionExercise->sets as $exerciseSet) {
                $entityManager->persist(object: $exerciseSet);
            }
        }
    }

    public function delete(Session $session): void
    {
        $this->removeChildren(sessionId: $session->id, keptSessionExerciseIds: []);
        $this->getEntityManager()->remove(object: $session);
    }

    /**
     * @param array<int, string> $keptSessionExerciseIds
     */
    private function removeChildren(string $sessionId, array $keptSessionExerciseIds): void
    {
        $entityManager = $this->getEntityManager();

        $droppedIds = $entityManager->createQueryBuilder()
            ->select('sessionExercise.id')
            ->from(from: SessionExercise::class, alias: 'sessionExercise')
            ->where('sessionExercise.sessionId = :sessionId')
            ->setParameter(key: 'sessionId', value: $sessionId);

        if ([] !== $keptSessionExerciseIds) {
            $droppedIds->andWhere('sessionExercise.id NOT IN (:keptSessionExerciseIds)')
                ->setParameter(key: 'keptSessionExerciseIds', value: $keptSessionExerciseIds);
        }

        $sessionExerciseIds = $droppedIds->getQuery()->getSingleColumnResult();

        if ([] !== $sessionExerciseIds) {
            $entityManager->createQueryBuilder()
                ->delete(delete: ExerciseSet::class, alias: 'exerciseSet')
                ->where('exerciseSet.sessionExerciseId IN (:sessionExerciseIds)')
                ->setParameter(key: 'sessionExerciseIds', value: $sessionExerciseIds)
                ->getQuery()
                ->execute();

            $entityManager->createQueryBuilder()
                ->delete(delete: SessionExercise::class, alias: 'sessionExercise')
                ->where('sessionExercise.id IN (:sessionExerciseIds)')
                ->setParameter(key: 'sessionExerciseIds', value: $sessionExerciseIds)
                ->getQuery()
                ->execute();
        }
    }

    /**
     * @param array<int, string> $keptSetIds
     */
    private function removeSets(string $sessionExerciseId, array $keptSetIds): void
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: ExerciseSet::class, alias: 'exerciseSet')
            ->where('exerciseSet.sessionExerciseId = :sessionExerciseId')
            ->setParameter(key: 'sessionExerciseId', value: $sessionExerciseId);

        if ([] !== $keptSetIds) {
            $queryBuilder->andWhere('exerciseSet.id NOT IN (:keptSetIds)')
                ->setParameter(key: 'keptSetIds', value: $keptSetIds);
        }

        $queryBuilder->getQuery()->execute();
    }
}
