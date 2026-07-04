<?php

namespace Nutrition\Catalog\Supermarket\Application\Query;

use Nutrition\Catalog\Supermarket\Domain\QueryModel\GetSupermarketsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetSupermarketsQueryHandler
{
    public function __construct(
        private GetSupermarketsNeedleDataQuery $needleDataQuery,
        private GetSupermarketsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetSupermarketsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            supermarkets: $this->needleDataQuery->findSupermarkets(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterName: $query->filterName,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalSupermarkets(
                filterName: $query->filterName,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
