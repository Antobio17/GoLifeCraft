<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftGrounding;

interface TicketDraftGroundingNeedleDataQuery
{
    public function load(): TicketDraftGrounding;
}
