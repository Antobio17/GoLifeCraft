<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetProductionsQueryHandler
{
    public function __construct(
        private GetProductionsNeedleDataQuery $needleDataQuery,
        private GetProductionsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetProductionsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            productions: $this->needleDataQuery->findProductions(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalProductions(),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
