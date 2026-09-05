<?php

namespace Nutrition\Pantry\Location\Domain\QueryModel;

use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationCandidatesResult;

interface GetLocationCandidatesNeedleDataQuery
{
    public function locationExists(string $locationId): bool;

    /**
     * Articles and recipes that could be placed in the location: everything but what already
     * sits there. One kept elsewhere comes back with its current location so the caller can
     * offer to move it rather than list it as if it were free.
     *
     * @return GetLocationCandidatesResult[]
     */
    public function findCandidates(
        string $locationId,
        int $pageSize,
        int $pageNumber,
        ?string $filterName = null,
        ?string $filterKind = null,
    ): array;

    public function totalCandidates(
        string $locationId,
        ?string $filterName = null,
        ?string $filterKind = null,
    ): int;
}
