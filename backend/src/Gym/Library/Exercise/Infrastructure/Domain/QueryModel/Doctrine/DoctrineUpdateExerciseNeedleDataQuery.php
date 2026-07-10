<?php

namespace Gym\Library\Exercise\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Library\Exercise\Domain\QueryModel\UpdateExerciseNeedleDataQuery;

final readonly class DoctrineUpdateExerciseNeedleDataQuery implements UpdateExerciseNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function exerciseWithNameAlreadyExists(
        string $name,
        string $excludingExerciseId,
    ): bool {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'exercise', alias: 'e')
            ->where('e.name = :name')
            ->andWhere('e.deleted = 0')
            ->andWhere('e.id != :excludingId')
            ->setParameter(key: 'name', value: $name)
            ->setParameter(key: 'excludingId', value: $excludingExerciseId)
            ->executeQuery()
            ->fetchOne() > 0;
    }
}
