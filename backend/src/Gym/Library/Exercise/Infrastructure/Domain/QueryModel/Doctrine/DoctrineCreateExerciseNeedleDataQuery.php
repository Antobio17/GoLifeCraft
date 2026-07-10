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
    ): bool {
        $qb = $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'exercise', alias: 'e')
            ->where('e.name = :name')
            ->andWhere('e.deleted = 0')
            ->setParameter(key: 'name', value: $name);

        return (int) $qb->executeQuery()->fetchOne() > 0;
    }
}
