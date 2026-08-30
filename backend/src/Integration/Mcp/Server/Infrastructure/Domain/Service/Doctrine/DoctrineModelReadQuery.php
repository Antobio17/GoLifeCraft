<?php

namespace Integration\Mcp\Server\Infrastructure\Domain\Service\Doctrine;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;
use Integration\Mcp\Server\Domain\QueryModel\Dto\ModelDescriptor;
use Integration\Mcp\Server\Domain\QueryModel\Dto\RelationDescriptor;
use Integration\Mcp\Server\Domain\Service\ModelReadQuery;

final readonly class DoctrineModelReadQuery implements ModelReadQuery
{
    private const string KIND_ONE = 'one';

    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function query(
        ModelDescriptor $descriptor,
        array $filters,
        array $include,
        array $sort,
        int $page,
        int $pageSize,
        array $includedDescriptors,
    ): array {
        $total = $this->count(descriptor: $descriptor, filters: $filters);

        $joined = $this->joinedRelations(descriptor: $descriptor, include: $include);

        $queryBuilder = $this->entityManager->createQueryBuilder()
            ->select('e')
            ->from(from: $descriptor->class, alias: 'e')
            ->setFirstResult(firstResult: ($page - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize);

        foreach ($joined as $relationName) {
            $queryBuilder->leftJoin(sprintf('e.%s', $relationName), $relationName)->addSelect($relationName);
        }

        $this->applyFilters(queryBuilder: $queryBuilder, filters: $filters);

        foreach ($sort as $clause) {
            $queryBuilder->addOrderBy(sprintf('e.%s', $clause['field']), 'desc' === ($clause['dir'] ?? 'asc') ? 'DESC' : 'ASC');
        }

        $records = array_map(
            fn (object $entity) => $this->mapEntity($descriptor, $entity, $joined, $includedDescriptors),
            $queryBuilder->getQuery()->getResult(),
        );

        foreach (array_diff($include, $joined) as $relationName) {
            $records = $this->attachChildren(
                relation: $descriptor->relation($relationName),
                childDescriptor: $includedDescriptors[$relationName],
                records: $records,
            );
        }

        return ['total' => $total, 'data' => $records];
    }

    private function count(ModelDescriptor $descriptor, array $filters): int
    {
        $queryBuilder = $this->entityManager->createQueryBuilder()
            ->select('count(e.id)')
            ->from(from: $descriptor->class, alias: 'e');

        $this->applyFilters(queryBuilder: $queryBuilder, filters: $filters);

        return (int) $queryBuilder->getQuery()->getSingleScalarResult();
    }

    private function applyFilters(QueryBuilder $queryBuilder, array $filters): void
    {
        $index = 0;

        foreach ($filters as $field => $condition) {
            $parameter = sprintf('filter_%d', $index++);

            if (is_array($condition) && array_key_exists('contains', $condition)) {
                $queryBuilder->andWhere(sprintf('e.%s LIKE :%s', $field, $parameter))
                    ->setParameter(key: $parameter, value: '%'.$condition['contains'].'%');
                continue;
            }

            $queryBuilder->andWhere(sprintf('e.%s = :%s', $field, $parameter))
                ->setParameter(key: $parameter, value: $condition);
        }
    }

    /**
     * @param string[] $include
     *
     * @return string[] the relations Doctrine can reach by navigation, the rest are read by their foreign key
     */
    private function joinedRelations(ModelDescriptor $descriptor, array $include): array
    {
        return array_values(array_filter(
            $include,
            static fn (string $name): bool => null === $descriptor->relation($name)?->foreignField,
        ));
    }

    /**
     * @param array<int, array<string, mixed>> $records
     *
     * @return array<int, array<string, mixed>>
     */
    private function attachChildren(RelationDescriptor $relation, ModelDescriptor $childDescriptor, array $records): array
    {
        $childrenByOwner = $this->childrenByOwner(
            relation: $relation,
            childDescriptor: $childDescriptor,
            ownerIds: array_column($records, 'id'),
        );

        return array_map(
            static function (array $record) use ($relation, $childrenByOwner): array {
                $children = $childrenByOwner[$record['id']] ?? [];
                $record[$relation->name] = self::KIND_ONE === $relation->kind ? ($children[0] ?? null) : $children;

                return $record;
            },
            $records,
        );
    }

    /**
     * @param string[] $ownerIds
     *
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function childrenByOwner(RelationDescriptor $relation, ModelDescriptor $childDescriptor, array $ownerIds): array
    {
        if ([] === $ownerIds) {
            return [];
        }

        $children = $this->entityManager->createQueryBuilder()
            ->select('c')
            ->from(from: $childDescriptor->class, alias: 'c')
            ->where(sprintf('c.%s IN (:ownerIds)', $relation->foreignField))
            ->setParameter(key: 'ownerIds', value: $ownerIds)
            ->addOrderBy('c.createdAt', 'ASC')
            ->addOrderBy('c.id', 'ASC')
            ->getQuery()
            ->getResult();

        $grouped = [];

        foreach ($children as $child) {
            $grouped[$child->{$relation->foreignField}][] = $this->mapRelated(descriptor: $childDescriptor, entity: $child);
        }

        return $grouped;
    }

    /**
     * @param string[]                       $include
     * @param array<string, ModelDescriptor> $includedDescriptors
     */
    private function mapEntity(ModelDescriptor $descriptor, object $entity, array $include, array $includedDescriptors): array
    {
        $record = ['id' => $entity->id];

        foreach ($descriptor->fields as $field) {
            $record[$field->name] = $this->readValue(entity: $entity, name: $field->name);
        }

        foreach ($include as $relationName) {
            $related = $entity->{$relationName} ?? null;
            $record[$relationName] = null === $related
                ? null
                : $this->mapRelated(descriptor: $includedDescriptors[$relationName], entity: $related);
        }

        return $record;
    }

    private function mapRelated(ModelDescriptor $descriptor, object $entity): array
    {
        $related = ['id' => $entity->id];

        foreach ($descriptor->fields as $field) {
            $related[$field->name] = $this->readValue(entity: $entity, name: $field->name);
        }

        return $related;
    }

    private function readValue(object $entity, string $name): mixed
    {
        $value = $entity->{$name} ?? null;

        if ($value instanceof \DateTime) {
            return $value->format(format: \DateTime::ATOM);
        }

        return $value;
    }
}
