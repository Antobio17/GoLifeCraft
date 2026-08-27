<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\Exception\GetProductionException;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetProductionQueryHandler
{
    public function __construct(
        private GetProductionNeedleDataQuery $needleDataQuery,
        private GetProductionDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetProductionQuery $query): QueryResult
    {
        $production = $this->needleDataQuery->findProductionById(productionId: $query->productionId);

        if (null === $production) {
            throw GetProductionException::notFound(productionId: $query->productionId);
        }

        return $this->dataTransform->transform(production: $production);
    }
}
