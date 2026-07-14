<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\UI\API\DataTransform;

use Nutrition\Recipe\Recipe\Application\Query\GetRecipesDataTransform;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\GetRecipesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetRecipesDataTransform implements GetRecipesDataTransform
{
    /**
     * @param GetRecipesResult[] $recipes
     */
    public function transform(
        array $recipes,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $recipes,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
