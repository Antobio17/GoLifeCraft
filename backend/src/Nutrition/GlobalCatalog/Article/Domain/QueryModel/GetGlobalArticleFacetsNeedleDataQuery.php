<?php

namespace Nutrition\GlobalCatalog\Article\Domain\QueryModel;

use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GlobalArticleCategoryCount;

interface GetGlobalArticleFacetsNeedleDataQuery
{
    /**
     * @return GlobalArticleCategoryCount[]
     */
    public function categories(?string $filterSource = null): array;
}
