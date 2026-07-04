<?php

namespace Nutrition\Catalog\Supermarket\Domain\QueryModel;

use Nutrition\Catalog\Supermarket\Domain\QueryModel\Dto\GetSupermarketResult;

interface GetSupermarketNeedleDataQuery
{
    public function findSupermarketById(string $supermarketId): ?GetSupermarketResult;
}
