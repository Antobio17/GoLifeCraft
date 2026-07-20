<?php

namespace Nutrition\Shopping\Shopping\Domain\QueryModel;

use Nutrition\Shopping\Shopping\Domain\QueryModel\Dto\GetShoppingListResult;

interface GetShoppingListNeedleDataQuery
{
    public function findShoppingList(): GetShoppingListResult;
}
