<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\GetTicketsResult;

interface GetTicketsNeedleDataQuery
{
    /**
     * @return GetTicketsResult[]
     */
    public function findTickets(
        int $pageSize,
        int $pageNumber,
        ?string $filterStatus,
        ?string $filterSearch,
        ?string $orderBy,
    ): array;

    public function totalTickets(?string $filterStatus, ?string $filterSearch): int;
}
