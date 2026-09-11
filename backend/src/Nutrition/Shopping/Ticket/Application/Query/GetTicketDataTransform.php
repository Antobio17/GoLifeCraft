<?php

namespace Nutrition\Shopping\Ticket\Application\Query;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\GetTicketResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetTicketDataTransform
{
    public function transform(GetTicketResult $ticket): QueryResult;
}
