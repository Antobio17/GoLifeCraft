<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel;

use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleResult;

interface GetArticleNeedleDataQuery
{
    public function findArticleById(string $articleId): ?GetArticleResult;
}
