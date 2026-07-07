<?php

namespace Gym\Library\Exercise\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Library\Exercise\Domain\QueryModel\CreateExerciseNeedleDataQuery;

final readonly class DoctrineCreateExerciseNeedleDataQuery implements CreateExerciseNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function exerciseWithNameAlreadyExists(
        string $name,
        ?string $excludingExerciseId = null,
    ): bool {
        $qb = $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'exercise', alias: 'e')
            ->where('e.name = :name')
            ->setParameter(key: 'name', value: $name);

        if (null !== $excludingExerciseId) {
            $qb->andWhere('e.id != :excludingId')
                ->setParameter(key: 'excludingId', value: $excludingExerciseId);
        }

        return (int) $qb->executeQuery()->fetchOne() > 0;
    }
}
