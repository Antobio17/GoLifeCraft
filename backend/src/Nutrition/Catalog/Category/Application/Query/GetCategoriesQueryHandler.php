<?php

namespace Nutrition\Catalog\Category\Application\Query;

use Nutrition\Catalog\Category\Domain\QueryModel\GetCategoriesNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetCategoriesQueryHandler
{
    public function __construct(
        private GetCategoriesNeedleDataQuery $needleDataQuery,
        private GetCategoriesDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetCategoriesQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            categories: $this->needleDataQuery->findCategories(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterName: $query->filterName,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalCategories(
                filterName: $query->filterName,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
