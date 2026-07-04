<?php

namespace Nutrition\Catalog\Supermarket\Application\Query;

use Nutrition\Catalog\Supermarket\Domain\QueryModel\Dto\GetSupermarketResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetSupermarketDataTransform
{
    public function transform(GetSupermarketResult $supermarket): QueryResult;
}
