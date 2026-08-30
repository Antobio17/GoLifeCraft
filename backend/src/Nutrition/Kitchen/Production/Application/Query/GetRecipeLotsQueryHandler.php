<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\QueryModel\GetRecipeLotsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetRecipeLotsQueryHandler
{
    public function __construct(
        private GetRecipeLotsNeedleDataQuery $needleDataQuery,
        private GetRecipeLotsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetRecipeLotsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            lots: $this->needleDataQuery->findLots(recipeId: $query->recipeId),
        );
    }
}
