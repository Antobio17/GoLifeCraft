<?php

namespace Nutrition\Shopping\Ticket\Application\Query;

use Nutrition\Shopping\Ticket\Domain\QueryModel\GetTicketsNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetTicketsQueryHandler
{
    public function __construct(
        private GetTicketsNeedleDataQuery $needleDataQuery,
        private GetTicketsDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetTicketsQuery $query): QueryResult
    {
        return $this->dataTransform->transform(
            tickets: $this->needleDataQuery->findTickets(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                filterStatus: $query->filterStatus,
                filterSearch: $query->filterSearch,
                orderBy: $query->orderBy,
            ),
            total: $this->needleDataQuery->totalTickets(
                filterStatus: $query->filterStatus,
                filterSearch: $query->filterSearch,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
