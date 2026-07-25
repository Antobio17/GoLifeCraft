<?php

namespace Nutrition\GlobalCatalog\Article\Domain\QueryModel;

interface GetGlobalArticleFacetsNeedleDataQuery
{
    /**
     * @return string[]
     */
    public function categories(?string $filterSource = null): array;
}
