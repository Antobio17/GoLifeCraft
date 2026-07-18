<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleFacetsResult;
use Nutrition\Catalog\Article\Domain\QueryModel\GetArticleFacetsNeedleDataQuery;

final readonly class GetArticleFacetsQueryHandler
{
    public function __construct(
        private GetArticleFacetsNeedleDataQuery $needleDataQuery,
    ) {
    }

    public function __invoke(GetArticleFacetsQuery $query): GetArticleFacetsResult
    {
        return new GetArticleFacetsResult(
            categories: $this->needleDataQuery->categories(),
            brands: $this->needleDataQuery->brands(),
            stores: $this->needleDataQuery->stores(),
        );
    }
}
