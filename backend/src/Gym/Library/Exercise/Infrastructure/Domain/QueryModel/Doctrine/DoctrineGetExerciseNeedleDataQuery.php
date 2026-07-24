<?php

namespace Gym\Library\Exercise\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Gym\Library\Exercise\Domain\QueryModel\Dto\GetExerciseResult;
use Gym\Library\Exercise\Domain\QueryModel\GetExerciseNeedleDataQuery;

final readonly class DoctrineGetExerciseNeedleDataQuery implements GetExerciseNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findExerciseById(string $exerciseId): ?GetExerciseResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                'e.id',
                'e.name',
                'e.description',
                'e.type',
                'e.muscle_groups',
                'e.icon',
                'e.created_at',
                'e.updated_at',
                'e.created_by_user_id',
                'e.updated_by_user_id'
            )
            ->from(table: 'exercise', alias: 'e')
            ->where('e.id = :id')
            ->andWhere('e.deleted = 0')
            ->setParameter(key: 'id', value: $exerciseId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $utc = new \DateTimeZone(timezone: 'UTC');

        return new GetExerciseResult(
            id: $row['id'],
            aggregateName: 'Exercise',
            name: $row['name'],
            description: $row['description'],
            type: $row['type'],
            muscleGroups: json_decode(json: $row['muscle_groups'] ?? '[]', associative: true) ?? [],
            icon: $row['icon'],
            createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
            updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }
}
