<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\DataTransform;

use Nutrition\Kitchen\Production\Application\Query\GetProductionProposalDataTransform;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionProposalResult;
use Shared\Shared\Shared\Application\Query\QueryResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class ApiGetProductionProposalDataTransform implements GetProductionProposalDataTransform
{
    public function transform(GetProductionProposalResult $proposal): QueryResult
    {
        return new QuerySingleResult(item: $proposal);
    }
}
