<?php

namespace Nutrition\Pantry\RecipeStock\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\RecipeStock\Domain\QueryModel\UpdateRecipeStockNeedleDataQuery;

final readonly class DoctrineUpdateRecipeStockNeedleDataQuery implements UpdateRecipeStockNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function recipeExists(string $recipeId): bool
    {
        $result = $this->connection->createQueryBuilder()
            ->select('r.id')
            ->from(table: 'recipe', alias: 'r')
            ->where('r.id = :recipeId')
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }
}
