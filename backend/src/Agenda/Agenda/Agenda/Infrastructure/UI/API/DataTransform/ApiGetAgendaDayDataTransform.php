<?php

namespace Agenda\Agenda\Agenda\Infrastructure\UI\API\DataTransform;

use Agenda\Agenda\Agenda\Application\Query\GetAgendaDayDataTransform;
use Agenda\Agenda\Agenda\Domain\QueryModel\Dto\GetAgendaDayResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetAgendaDayDataTransform implements GetAgendaDayDataTransform
{
    public function transform(GetAgendaDayResult $day): QueryResult
    {
        return new QuerySingleResult(item: $day);
    }
}
