<?php

namespace Nutrition\Recipe\Recipe\Application\Query;

use Nutrition\Recipe\Recipe\Domain\Exception\GetRecipeException;
use Nutrition\Recipe\Recipe\Domain\QueryModel\GetRecipeNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetRecipeQueryHandler
{
    public function __construct(
        private GetRecipeNeedleDataQuery $needleDataQuery,
        private GetRecipeDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetRecipeQuery $query): QueryResult
    {
        $recipe = $this->needleDataQuery->findRecipeById(
            recipeId: $query->recipeId,
        );

        if (null === $recipe) {
            throw GetRecipeException::notFound(recipeId: $query->recipeId);
        }

        return $this->dataTransform->transform(recipe: $recipe);
    }
}
