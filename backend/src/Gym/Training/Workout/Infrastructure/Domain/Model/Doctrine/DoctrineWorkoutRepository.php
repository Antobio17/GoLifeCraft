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
        return $this->getEntityManager()->createQueryBuilder()
            ->select('workout')
            ->from(from: Workout::class, alias: 'workout')
            ->where('workout.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(Workout $workout): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeChildren(workoutId: $workout->id);
        $entityManager->persist(object: $workout);

        foreach ($workout->exercises as $workoutExercise) {
            $entityManager->persist(object: $workoutExercise);

            foreach ($workoutExercise->sets as $workoutSet) {
                $entityManager->persist(object: $workoutSet);
            }
        }
    }

    public function delete(Workout $workout): void
    {
        $this->removeChildren(workoutId: $workout->id);
        $this->getEntityManager()->remove(object: $workout);
    }

    private function removeChildren(string $workoutId): void
    {
        $entityManager = $this->getEntityManager();

        $workoutExerciseIds = $entityManager->createQueryBuilder()
            ->select('workoutExercise.id')
            ->from(from: WorkoutExercise::class, alias: 'workoutExercise')
            ->where('workoutExercise.workoutId = :workoutId')
            ->setParameter(key: 'workoutId', value: $workoutId)
            ->getQuery()
            ->getSingleColumnResult();

        if ([] !== $workoutExerciseIds) {
            $entityManager->createQueryBuilder()
                ->delete(delete: WorkoutSet::class, alias: 'workoutSet')
                ->where('workoutSet.workoutExerciseId IN (:workoutExerciseIds)')
                ->setParameter(key: 'workoutExerciseIds', value: $workoutExerciseIds)
                ->getQuery()
                ->execute();
        }

        $entityManager->createQueryBuilder()
            ->delete(delete: WorkoutExercise::class, alias: 'workoutExercise')
            ->where('workoutExercise.workoutId = :workoutId')
            ->setParameter(key: 'workoutId', value: $workoutId)
            ->getQuery()
            ->execute();
    }
}
