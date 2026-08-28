<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel;

use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\GetProductionProposalResult;

interface GetProductionProposalNeedleDataQuery
{
    public function findProposal(string $fromDate, string $toDate): GetProductionProposalResult;
}
