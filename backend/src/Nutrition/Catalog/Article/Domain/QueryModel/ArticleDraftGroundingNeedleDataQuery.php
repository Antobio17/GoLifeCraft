<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel;

use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftGrounding;

interface ArticleDraftGroundingNeedleDataQuery
{
    public function load(): ArticleDraftGrounding;
}
