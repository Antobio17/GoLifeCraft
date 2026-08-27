<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionRecipeSnapshot;
use Nutrition\Kitchen\Production\Domain\QueryModel\StartProductionNeedleDataQuery;

final readonly class DoctrineStartProductionNeedleDataQuery implements StartProductionNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findRecipeSnapshot(string $recipeId): ?ProductionRecipeSnapshot
    {
        $row = $this->connection->createQueryBuilder()
            ->select('r.id', 'r.name', 'r.emoji', 'r.servings')
            ->from(table: 'recipe', alias: 'r')
            ->where('r.id = :recipeId')
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        return new ProductionRecipeSnapshot(
            recipeId: $row['id'],
            name: $row['name'],
            emoji: $row['emoji'],
            servings: (int) $row['servings'],
        );
    }
}
