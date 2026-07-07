<?php

namespace Gym\Library\Exercise\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Gym\Library\Exercise\Domain\Model\Exercise;
use Gym\Library\Exercise\Domain\Model\ExerciseRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineExerciseRepository extends EntityRepository implements ExerciseRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Exercise
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('exercise')
            ->from(from: Exercise::class, alias: 'exercise')
            ->where('exercise.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(Exercise $exercise): void
    {
        $this->getEntityManager()->persist(object: $exercise);
    }

    public function delete(Exercise $exercise): void
    {
        $this->getEntityManager()->remove(object: $exercise);
    }
}
