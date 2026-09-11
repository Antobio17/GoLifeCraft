<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\UI\API\DataTransform;

use Nutrition\Shopping\Ticket\Application\Query\GetTicketsDataTransform;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\GetTicketsResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetTicketsDataTransform implements GetTicketsDataTransform
{
    /**
     * @param GetTicketsResult[] $tickets
     */
    public function transform(
        array $tickets,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $tickets,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
