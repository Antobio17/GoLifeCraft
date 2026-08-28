<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionProposalResult;
use Shared\Shared\Shared\Application\Query\QueryResult;

interface GetProductionProposalDataTransform
{
    public function transform(GetProductionProposalResult $proposal): QueryResult;
}
