<?php

namespace Nutrition\Menu\Menu\Infrastructure\UI\API\DataTransform;

use Nutrition\Menu\Menu\Application\Query\GetMenusDataTransform;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\GetMenusResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetMenusDataTransform implements GetMenusDataTransform
{
    /**
     * @param GetMenusResult[] $menus
     */
    public function transform(
        array $menus,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $menus,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
