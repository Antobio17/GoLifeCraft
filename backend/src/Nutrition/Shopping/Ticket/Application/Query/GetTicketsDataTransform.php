<?php

namespace Nutrition\Shopping\Ticket\Application\Query;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\GetTicketsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetTicketsDataTransform
{
    /**
     * @param GetTicketsResult[] $tickets
     */
    public function transform(
        array $tickets,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
