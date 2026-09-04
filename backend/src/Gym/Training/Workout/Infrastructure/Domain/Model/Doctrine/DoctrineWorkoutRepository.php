<?php

namespace Gym\Training\Workout\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Gym\Training\Workout\Domain\Model\Workout;
use Gym\Training\Workout\Domain\Model\WorkoutExercise;
use Gym\Training\Workout\Domain\Model\WorkoutRepository;
use Gym\Training\Workout\Domain\Model\WorkoutSet;
use Ramsey\Uuid\Uuid;

final class DoctrineWorkoutRepository extends EntityRepository implements WorkoutRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Workout
    {
        $workout = $this->getEntityManager()->createQueryBuilder()
            ->select('workout')
            ->from(from: Workout::class, alias: 'workout')
            ->where('workout.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();

        if (null === $workout) {
            return null;
        }

        $workout->exercises = $this->findExercises(workoutId: $workout->id);

        return $workout;
    }

    /**
     * Reconciles the children by id: a command that does not rebuild them keeps the ones it loaded,
     * so wiping them all would drop the exercises of every caller that only touches the workout itself.
     */
    public function save(Workout $workout): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeChildren(
            workoutId: $workout->id,
            keptExerciseIds: array_map(
                callback: static fn (WorkoutExercise $workoutExercise): string => $workoutExercise->id,
                array: $workout->exercises,
            ),
        );
        $entityManager->persist(object: $workout);

        foreach ($workout->exercises as $workoutExercise) {
            $entityManager->persist(object: $workoutExercise);
            $this->removeSets(
                workoutExerciseId: $workoutExercise->id,
                keptSetIds: array_map(
                    callback: static fn (WorkoutSet $workoutSet): string => $workoutSet->id,
                    array: $workoutExercise->sets,
                ),
            );

            foreach ($workoutExercise->sets as $workoutSet) {
                $entityManager->persist(object: $workoutSet);
            }
        }
    }

    public function delete(Workout $workout): void
    {
        $this->removeChildren(workoutId: $workout->id, keptExerciseIds: []);
        $this->getEntityManager()->remove(object: $workout);
    }

    /**
     * @return WorkoutExercise[]
     */
    private function findExercises(string $workoutId): array
    {
        $workoutExercises = $this->getEntityManager()->getRepository(className: WorkoutExercise::class)
            ->findBy(criteria: ['workoutId' => $workoutId], orderBy: ['position' => 'ASC']);

        if ([] === $workoutExercises) {
            return [];
        }

        $workoutSets = $this->getEntityManager()->createQueryBuilder()
            ->select('workoutSet')
            ->from(from: WorkoutSet::class, alias: 'workoutSet')
            ->where('workoutSet.workoutExerciseId IN (:workoutExerciseIds)')
            ->setParameter(key: 'workoutExerciseIds', value: array_map(
                callback: static fn (WorkoutExercise $workoutExercise): string => $workoutExercise->id,
                array: $workoutExercises,
            ))
            ->orderBy(sort: 'workoutSet.position', order: 'ASC')
            ->getQuery()
            ->getResult();

        $byExercise = [];

        foreach ($workoutSets as $workoutSet) {
            $byExercise[$workoutSet->workoutExerciseId][] = $workoutSet;
        }

        foreach ($workoutExercises as $workoutExercise) {
            $workoutExercise->sets = $byExercise[$workoutExercise->id] ?? [];
        }

        return $workoutExercises;
    }

    /**
     * @param array<int, string> $keptExerciseIds
     */
    private function removeChildren(string $workoutId, array $keptExerciseIds): void
    {
        $entityManager = $this->getEntityManager();

        $droppedIds = $entityManager->createQueryBuilder()
            ->select('workoutExercise.id')
            ->from(from: WorkoutExercise::class, alias: 'workoutExercise')
            ->where('workoutExercise.workoutId = :workoutId')
            ->setParameter(key: 'workoutId', value: $workoutId);

        if ([] !== $keptExerciseIds) {
            $droppedIds->andWhere('workoutExercise.id NOT IN (:keptExerciseIds)')
                ->setParameter(key: 'keptExerciseIds', value: $keptExerciseIds);
        }

        $workoutExerciseIds = $droppedIds->getQuery()->getSingleColumnResult();

        if ([] === $workoutExerciseIds) {
            return;
        }

        $entityManager->createQueryBuilder()
            ->delete(delete: WorkoutSet::class, alias: 'workoutSet')
            ->where('workoutSet.workoutExerciseId IN (:workoutExerciseIds)')
            ->setParameter(key: 'workoutExerciseIds', value: $workoutExerciseIds)
            ->getQuery()
            ->execute();

        $entityManager->createQueryBuilder()
            ->delete(delete: WorkoutExercise::class, alias: 'workoutExercise')
            ->where('workoutExercise.id IN (:workoutExerciseIds)')
            ->setParameter(key: 'workoutExerciseIds', value: $workoutExerciseIds)
            ->getQuery()
            ->execute();
    }

    /**
     * @param array<int, string> $keptSetIds
     */
    private function removeSets(string $workoutExerciseId, array $keptSetIds): void
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: WorkoutSet::class, alias: 'workoutSet')
            ->where('workoutSet.workoutExerciseId = :workoutExerciseId')
            ->setParameter(key: 'workoutExerciseId', value: $workoutExerciseId);

        if ([] !== $keptSetIds) {
            $queryBuilder->andWhere('workoutSet.id NOT IN (:keptSetIds)')
                ->setParameter(key: 'keptSetIds', value: $keptSetIds);
        }

        $queryBuilder->getQuery()->execute();
    }
}
