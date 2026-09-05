<?php

namespace Nutrition\Pantry\Location\Application\Query;

use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationCandidatesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetLocationCandidatesDataTransform
{
    /**
     * @param GetLocationCandidatesResult[] $candidates
     */
    public function transform(
        array $candidates,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult;
}
