<?php

namespace Nutrition\Pantry\Stock\Domain\QueryModel;

interface MoveArticleStockNeedleDataQuery
{
    public function articleExists(string $articleId): bool;

    public function locationExists(string $locationId): bool;
}
