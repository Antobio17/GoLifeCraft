<?php

namespace Mcp\Server\Mcp\Infrastructure\Domain\Service\Doctrine;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;
use Mcp\Server\Mcp\Domain\QueryModel\Dto\ModelDescriptor;
use Mcp\Server\Mcp\Domain\Service\ModelReadQuery;

final readonly class DoctrineModelReadQuery implements ModelReadQuery
{
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

        $queryBuilder = $this->entityManager->createQueryBuilder()
            ->select('e')
            ->from(from: $descriptor->class, alias: 'e')
            ->setFirstResult(firstResult: ($page - 1) * $pageSize)
            ->setMaxResults(maxResults: $pageSize);

        foreach ($include as $relationName) {
            $queryBuilder->leftJoin(sprintf('e.%s', $relationName), $relationName)->addSelect($relationName);
        }

        $this->applyFilters(queryBuilder: $queryBuilder, filters: $filters);

        foreach ($sort as $clause) {
            $queryBuilder->addOrderBy(sprintf('e.%s', $clause['field']), 'desc' === ($clause['dir'] ?? 'asc') ? 'DESC' : 'ASC');
        }

        $records = array_map(
            fn (object $entity) => $this->mapEntity($descriptor, $entity, $include, $includedDescriptors),
            $queryBuilder->getQuery()->getResult(),
        );

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
