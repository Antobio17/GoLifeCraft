<?php

namespace Mcp\Server\Mcp\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\ORM\EntityManagerInterface;
use Mcp\Server\Mcp\Domain\QueryModel\ModelExistsNeedleDataQuery;

final readonly class DoctrineModelExistsNeedleDataQuery implements ModelExistsNeedleDataQuery
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function exists(string $class, string $field, mixed $value, ?string $excludeId): bool
    {
        $queryBuilder = $this->entityManager->createQueryBuilder()
            ->select('count(e.id)')
            ->from(from: $class, alias: 'e')
            ->where(sprintf('e.%s = :value', $field))
            ->setParameter(key: 'value', value: $value);

        if (null !== $excludeId) {
            $queryBuilder->andWhere('e.id != :excludeId')
                ->setParameter(key: 'excludeId', value: $excludeId);
        }

        return (int) $queryBuilder->getQuery()->getSingleScalarResult() > 0;
    }
}
