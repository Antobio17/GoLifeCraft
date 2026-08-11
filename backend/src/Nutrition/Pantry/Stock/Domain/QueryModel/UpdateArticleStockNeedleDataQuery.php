<?php

namespace Nutrition\Pantry\Stock\Domain\QueryModel;

interface UpdateArticleStockNeedleDataQuery
{
    public function articleExists(string $articleId): bool;
}
