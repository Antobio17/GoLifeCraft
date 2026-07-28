<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Nutrition\Menu\Menu\Domain\Exception\GetMenuException;
use Nutrition\Menu\Menu\Domain\QueryModel\GetMenuShoppingNeedsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetMenuShoppingNeedsQueryHandler
{
    public function __construct(
        private GetMenuShoppingNeedsNeedleDataQuery $needleDataQuery,
        private GetMenuShoppingNeedsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetMenuShoppingNeedsQuery $query): QueryResult
    {
        $shoppingNeeds = $this->needleDataQuery->findShoppingNeeds(menuId: $query->menuId);
        if (null === $shoppingNeeds) {
            throw GetMenuException::menuNotFound(menuId: $query->menuId);
        }

        return $this->dataTransform->transform(shoppingNeeds: $shoppingNeeds);
    }
}
