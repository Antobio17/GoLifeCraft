<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Nutrition\Catalog\Article\Domain\QueryModel\GetArticlesNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetArticlesQueryHandler
{
    public function __construct(
        private GetArticlesNeedleDataQuery $needleDataQuery,
        private GetArticlesDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetArticlesQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            articles: $this->needleDataQuery->findArticles(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterName: $query->filterName,
                filterCategory: $query->filterCategory,
                filterBrand: $query->filterBrand,
                filterStore: $query->filterStore,
                filterFavorite: $query->filterFavorite,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalArticles(
                filterName: $query->filterName,
                filterCategory: $query->filterCategory,
                filterBrand: $query->filterBrand,
                filterStore: $query->filterStore,
                filterFavorite: $query->filterFavorite,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
