<?php

namespace Gym\Library\Exercise\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;
use Gym\Library\Exercise\Domain\QueryModel\Dto\GetExercisesResult;
use Gym\Library\Exercise\Domain\QueryModel\GetExercisesNeedleDataQuery;

final readonly class DoctrineGetExercisesNeedleDataQuery implements GetExercisesNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findExercises(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterType = null,
        ?string $filterMuscleGroup = null,
        ?string $orderBy = null,
    ): array {
        $qb = $this->getBaseQuery(
            filterName: $filterName,
            filterType: $filterType,
            filterMuscleGroup: $filterMuscleGroup,
        )->select(
            'e.id',
            'e.name',
            'e.description',
            'e.type',
            'e.muscle_groups',
            'e.created_at',
            'e.updated_at',
            'e.created_by_user_id',
            'e.updated_by_user_id'
        );

        $this->applyOrdering(qb: $qb, orderBy: $orderBy);

        $result = $qb->setFirstResult(firstResult: ($pageNumber - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize)
            ->executeQuery()
            ->fetchAllAssociative();

        $utc = new \DateTimeZone(timezone: 'UTC');

        return array_map(callback: function ($row) use ($utc): GetExercisesResult {
            return new GetExercisesResult(
                id: $row['id'],
                aggregateName: 'Exercise',
                name: $row['name'],
                description: $row['description'],
                type: $row['type'],
                muscleGroups: json_decode(json: $row['muscle_groups'] ?? '[]', associative: true) ?? [],
                createdAt: new \DateTime(datetime: $row['created_at'], timezone: $utc),
                updatedAt: new \DateTime(datetime: $row['updated_at'], timezone: $utc),
                createdByUserId: $row['created_by_user_id'],
                updatedByUserId: $row['updated_by_user_id'],
            );
        }, array: $result);
    }

    public function totalExercises(
        ?string $filterName = null,
        ?string $filterType = null,
        ?string $filterMuscleGroup = null,
    ): int {
        return (int) $this->getBaseQuery(
            filterName: $filterName,
            filterType: $filterType,
            filterMuscleGroup: $filterMuscleGroup,
        )->select('COUNT(*)')->executeQuery()->fetchOne();
    }

    private function getBaseQuery(
        ?string $filterName,
        ?string $filterType,
        ?string $filterMuscleGroup,
    ): QueryBuilder {
        $qb = $this->connection->createQueryBuilder()->from(table: 'exercise', alias: 'e');

        if (null !== $filterName) {
            $qb->andWhere('e.name LIKE :name')
                ->setParameter(key: 'name', value: '%'.$filterName.'%');
        }

        if (null !== $filterType) {
            $qb->andWhere('e.type = :type')
                ->setParameter(key: 'type', value: $filterType);
        }

        if (null !== $filterMuscleGroup) {
            $qb->andWhere('e.muscle_groups LIKE :muscleGroup')
                ->setParameter(key: 'muscleGroup', value: '%"'.$filterMuscleGroup.'"%');
        }

        return $qb;
    }

    private function applyOrdering(QueryBuilder $qb, ?string $orderBy): void
    {
        $allowedFields = [
            'name' => 'e.name',
            'createdAt' => 'e.created_at',
            'updatedAt' => 'e.updated_at',
        ];

        if (null === $orderBy) {
            $qb->orderBy(sort: 'e.name', order: 'ASC');

            return;
        }

        $direction = 'ASC';
        $field = $orderBy;

        if (str_starts_with(haystack: $orderBy, needle: '-')) {
            $direction = 'DESC';
            $field = substr(string: $orderBy, offset: 1);
        }

        if (!isset($allowedFields[$field])) {
            $qb->orderBy(sort: 'e.name', order: 'ASC');

            return;
        }

        $qb->orderBy(sort: $allowedFields[$field], order: $direction);
    }
}
