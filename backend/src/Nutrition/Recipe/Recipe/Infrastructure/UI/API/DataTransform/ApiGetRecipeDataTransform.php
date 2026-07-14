<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\UI\API\DataTransform;

use Nutrition\Recipe\Recipe\Application\Query\GetRecipeDataTransform;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\GetRecipeResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetRecipeDataTransform implements GetRecipeDataTransform
{
    public function transform(GetRecipeResult $recipe): QueryResult
    {
        return new QuerySingleResult(item: $recipe);
    }
}
