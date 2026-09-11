<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\UI\API\DataTransform;

use Nutrition\Shopping\Ticket\Application\Query\GetTicketDataTransform;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\GetTicketResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetTicketDataTransform implements GetTicketDataTransform
{
    public function transform(GetTicketResult $ticket): QueryResult
    {
        return new QuerySingleResult(item: $ticket);
    }
}
