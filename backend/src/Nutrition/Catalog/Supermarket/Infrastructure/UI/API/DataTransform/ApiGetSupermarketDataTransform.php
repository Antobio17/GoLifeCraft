<?php

namespace Nutrition\Catalog\Supermarket\Infrastructure\UI\API\DataTransform;

use Nutrition\Catalog\Supermarket\Application\Query\GetSupermarketDataTransform;
use Nutrition\Catalog\Supermarket\Domain\QueryModel\Dto\GetSupermarketResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetSupermarketDataTransform implements GetSupermarketDataTransform
{
    public function transform(GetSupermarketResult $supermarket): QueryResult
    {
        return new QuerySingleResult(item: $supermarket);
    }
}
