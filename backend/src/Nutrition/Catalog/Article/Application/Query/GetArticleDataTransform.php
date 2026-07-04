<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetArticleDataTransform
{
    public function transform(GetArticleResult $article): QueryResult;
}
