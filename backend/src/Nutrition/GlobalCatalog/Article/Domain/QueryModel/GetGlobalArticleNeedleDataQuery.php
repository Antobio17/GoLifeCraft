<?php

namespace Nutrition\GlobalCatalog\Article\Domain\QueryModel;

use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticleResult;

interface GetGlobalArticleNeedleDataQuery
{
    public function findGlobalArticleById(string $globalArticleId): ?GetGlobalArticleResult;
}
