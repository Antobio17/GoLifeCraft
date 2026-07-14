<?php

namespace Nutrition\Recipe\Recipe\Application\Query;

use Nutrition\Recipe\Recipe\Domain\QueryModel\GetRecipesNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetRecipesQueryHandler
{
    public function __construct(
        private GetRecipesNeedleDataQuery $needleDataQuery,
        private GetRecipesDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetRecipesQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            recipes: $this->needleDataQuery->findRecipes(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterName: $query->filterName,
                filterCategory: $query->filterCategory,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalRecipes(
                filterName: $query->filterName,
                filterCategory: $query->filterCategory,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
