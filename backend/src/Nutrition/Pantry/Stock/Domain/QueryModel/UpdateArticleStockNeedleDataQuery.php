<?php

namespace Nutrition\Pantry\Stock\Domain\QueryModel;

use Nutrition\Pantry\Stock\Domain\QueryModel\Dto\ArticleStockPolicy;

interface UpdateArticleStockNeedleDataQuery
{
    public function findArticlePolicy(string $articleId): ?ArticleStockPolicy;
}
