<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel;

interface GetArticleFacetsNeedleDataQuery
{
    /**
     * @return string[]
     */
    public function categories(): array;

    /**
     * @return string[]
     */
    public function brands(): array;

    /**
     * @return string[]
     */
    public function stores(): array;
}
