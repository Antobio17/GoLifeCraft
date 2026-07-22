<?php

namespace Nutrition\GlobalCatalog\Article\Application\Query;

use Nutrition\GlobalCatalog\Article\Domain\QueryModel\GetGlobalArticlesNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetGlobalArticlesQueryHandler
{
    public function __construct(
        private GetGlobalArticlesNeedleDataQuery $needleDataQuery,
        private GetGlobalArticlesDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetGlobalArticlesQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            globalArticles: $this->needleDataQuery->findGlobalArticles(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterName: $query->filterName,
                filterSource: $query->filterSource,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalGlobalArticles(
                filterName: $query->filterName,
                filterSource: $query->filterSource,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
