<?php

namespace Agenda\Agenda\Agenda\Application\Query;

use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaDayResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetAgendaDayDataTransform
{
    public function transform(GetAgendaDayResult $day): QueryResult;
}
