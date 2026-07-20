<?php

namespace Nutrition\Shopping\Shopping\Application\Query;

use Nutrition\Shopping\Shopping\Domain\QueryModel\Dto\GetShoppingListResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetShoppingListDataTransform
{
    public function transform(GetShoppingListResult $shoppingList): QueryResult;
}
