<?php

namespace Nutrition\Pantry\Location\Domain\QueryModel;

use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationCandidatesResult;

interface GetLocationCandidatesNeedleDataQuery
{
    public function locationExists(string $locationId): bool;

    /**
     * @return GetLocationCandidatesResult[]
     */
    public function findCandidates(
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterKind = null,
    ): array;

    public function totalCandidates(
        ?string $filterName = null,
        ?string $filterKind = null,
    ): int;
}
