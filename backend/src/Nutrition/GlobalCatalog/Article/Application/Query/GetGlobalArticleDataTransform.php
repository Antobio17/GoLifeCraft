<?php

namespace Nutrition\GlobalCatalog\Article\Application\Query;

use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticleResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetGlobalArticleDataTransform
{
    public function transform(GetGlobalArticleResult $globalArticle): QueryResult;
}
