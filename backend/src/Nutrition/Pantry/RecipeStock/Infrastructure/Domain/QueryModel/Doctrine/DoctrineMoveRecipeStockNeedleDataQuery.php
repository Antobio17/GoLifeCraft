<?php

namespace Nutrition\Pantry\RecipeStock\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\RecipeStock\Domain\QueryModel\MoveRecipeStockNeedleDataQuery;

final readonly class DoctrineMoveRecipeStockNeedleDataQuery implements MoveRecipeStockNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function recipeExists(string $recipeId): bool
    {
        return $this->exists(table: 'recipe', id: $recipeId);
    }

    public function locationExists(string $locationId): bool
    {
        return $this->exists(table: 'pantry_location', id: $locationId);
    }

    private function exists(string $table, string $id): bool
    {
        $result = $this->connection->createQueryBuilder()
            ->select('t.id')
            ->from(table: $table, alias: 't')
            ->where('t.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }
}
