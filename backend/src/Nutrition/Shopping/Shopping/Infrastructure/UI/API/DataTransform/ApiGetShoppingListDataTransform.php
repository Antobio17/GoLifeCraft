<?php

namespace Nutrition\Shopping\Shopping\Infrastructure\UI\API\DataTransform;

use Nutrition\Shopping\Shopping\Application\Query\GetShoppingListDataTransform;
use Nutrition\Shopping\Shopping\Domain\QueryModel\Dto\GetShoppingListResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetShoppingListDataTransform implements GetShoppingListDataTransform
{
    public function transform(GetShoppingListResult $shoppingList): QueryResult
    {
        return new QuerySingleResult(item: $shoppingList);
    }
}
