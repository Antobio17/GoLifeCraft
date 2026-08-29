<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionNeeds;
use Nutrition\Kitchen\Production\Domain\QueryModel\FinishProductionNeedleDataQuery;

final readonly class DoctrineFinishProductionNeedleDataQuery implements FinishProductionNeedleDataQuery
{
    public function __construct(
        private Connection $connection,
        private DoctrineProductionIngredientResolver $ingredientResolver,
    ) {
    }

    public function stepPositions(string $recipeId): array
    {
        return array_map(callback: static fn (mixed $position): int => (int) $position, array: $this->connection
            ->createQueryBuilder()
            ->select('rs.position')
            ->from(table: 'recipe_step', alias: 'rs')
            ->where('rs.recipe_id = :recipeId')
            ->setParameter(key: 'recipeId', value: $recipeId)
            ->orderBy('rs.position', 'ASC')
            ->executeQuery()
            ->fetchFirstColumn());
    }

    public function resolveNeeds(string $recipeId, float $servings): ProductionNeeds
    {
        return $this->ingredientResolver->resolveDirect(recipeId: $recipeId, servings: $servings);
    }
}
