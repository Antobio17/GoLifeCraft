<?php

namespace Nutrition\Pantry\Movement\Domain\QueryModel;

use Nutrition\Catalog\Article\Domain\Model\ArticlePack;

interface CorrectArticleStockNeedleDataQuery
{
    public function findArticlePack(string $articleId): ?ArticlePack;
}
