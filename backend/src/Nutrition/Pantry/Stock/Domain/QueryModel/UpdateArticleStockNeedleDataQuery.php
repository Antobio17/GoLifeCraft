<?php

namespace Nutrition\Pantry\Stock\Domain\QueryModel;

use Nutrition\Catalog\Article\Domain\Model\ArticlePack;

interface UpdateArticleStockNeedleDataQuery
{
    public function findArticlePack(string $articleId): ?ArticlePack;
}
