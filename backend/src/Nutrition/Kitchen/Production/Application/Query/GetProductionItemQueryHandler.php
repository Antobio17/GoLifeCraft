<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\Exception\GetProductionException;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionItemNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetProductionItemQueryHandler
{
    public function __construct(
        private GetProductionItemNeedleDataQuery $needleDataQuery,
        private GetProductionItemDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetProductionItemQuery $query): QueryResult
    {
        $item = $this->needleDataQuery->findItemById(
            productionId: $query->productionId,
            itemId: $query->itemId,
        );

        if (null === $item) {
            throw GetProductionException::itemNotFound(
                productionId: $query->productionId,
                itemId: $query->itemId,
            );
        }

        return $this->dataTransform->transform(item: $item);
    }
}
