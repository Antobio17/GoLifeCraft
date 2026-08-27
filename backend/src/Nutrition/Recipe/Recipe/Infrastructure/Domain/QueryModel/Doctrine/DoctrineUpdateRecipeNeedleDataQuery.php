<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Recipe\Recipe\Application\Command\RecipeStepData;
use Nutrition\Recipe\Recipe\Domain\QueryModel\UpdateRecipeNeedleDataQuery;

final readonly class DoctrineUpdateRecipeNeedleDataQuery implements UpdateRecipeNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findStepsOf(string $recipeId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('rs.position', 'rs.text', 'rs.minutes')
            ->from(table: 'recipe_step', alias: 'rs')
            ->where('rs.recipe_id = :recipeId')
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->orderBy('rs.position', 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(callback: static fn (array $row): RecipeStepData => new RecipeStepData(
            text: (string) $row['text'],
            position: (int) $row['position'],
            minutes: null !== $row['minutes'] ? (int) $row['minutes'] : null,
        ), array: $rows);
    }

    public function recipeWithNameAlreadyExists(
        string $name,
        string $excludingRecipeId,
    ): bool {
        return (int) $this->connection->createQueryBuilder()
            ->select('COUNT(*)')
            ->from(table: 'recipe', alias: 'r')
            ->where('r.name = :name')
            ->andWhere('r.id != :excludingId')
            ->setParameter(key: 'name', value: $name)
            ->setParameter(key: 'excludingId', value: $excludingRecipeId)
            ->executeQuery()
            ->fetchOne() > 0;
    }
}
