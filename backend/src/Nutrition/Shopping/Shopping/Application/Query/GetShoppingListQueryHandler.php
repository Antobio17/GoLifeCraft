<?php

namespace Nutrition\Shopping\Shopping\Application\Query;

use Nutrition\Shopping\Shopping\Domain\QueryModel\GetShoppingListNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetShoppingListQueryHandler
{
    public function __construct(
        private GetShoppingListNeedleDataQuery $needleDataQuery,
        private GetShoppingListDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetShoppingListQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            shoppingList: $this->needleDataQuery->findShoppingList(),
        );
    }
}
