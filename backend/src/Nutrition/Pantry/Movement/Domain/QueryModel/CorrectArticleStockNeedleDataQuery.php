<?php

namespace Nutrition\Pantry\Movement\Domain\QueryModel;

use Nutrition\Pantry\Movement\Domain\Model\ArticleStockReference;

interface CorrectArticleStockNeedleDataQuery
{
    public function findArticleReference(string $articleId): ?ArticleStockReference;
}
