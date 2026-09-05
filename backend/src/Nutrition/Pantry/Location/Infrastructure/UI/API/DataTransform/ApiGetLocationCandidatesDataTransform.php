<?php

namespace Nutrition\Pantry\Location\Infrastructure\UI\API\DataTransform;

use Nutrition\Pantry\Location\Application\Query\GetLocationCandidatesDataTransform;
use Nutrition\Pantry\Location\Domain\QueryModel\Dto\GetLocationCandidatesResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class ApiGetLocationCandidatesDataTransform implements GetLocationCandidatesDataTransform
{
    /**
     * @param GetLocationCandidatesResult[] $candidates
     */
    public function transform(
        array $candidates,
        int $total,
        int $pageNumber,
        int $pageSize,
    ): QueryResult {
        return new QueryCollectionResult(
            items: $candidates,
            pageNumber: $pageNumber,
            pageSize: $pageSize,
            total: $total,
        );
    }
}
