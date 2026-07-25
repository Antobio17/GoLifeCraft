<?php

namespace Nutrition\GlobalCatalog\Article\Application\Query;

use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticleFacetsResult;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\GetGlobalArticleFacetsNeedleDataQuery;

final readonly class GetGlobalArticleFacetsQueryHandler
{
    public function __construct(
        private GetGlobalArticleFacetsNeedleDataQuery $needleDataQuery,
    ) {
    }

    public function __invoke(GetGlobalArticleFacetsQuery $query): GetGlobalArticleFacetsResult
    {
        return new GetGlobalArticleFacetsResult(
            categories: $this->needleDataQuery->categories(filterSource: $query->filterSource),
        );
    }
}
