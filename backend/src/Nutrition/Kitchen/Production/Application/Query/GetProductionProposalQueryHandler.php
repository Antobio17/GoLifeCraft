<?php

namespace Nutrition\Kitchen\Production\Application\Query;

use Nutrition\Kitchen\Production\Domain\Exception\GetProductionException;
use Nutrition\Kitchen\Production\Domain\QueryModel\GetProductionProposalNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetProductionProposalQueryHandler
{
    public function __construct(
        private GetProductionProposalNeedleDataQuery $needleDataQuery,
        private GetProductionProposalDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetProductionProposalQuery $query): QueryResult
    {
        if ($query->toDate < $query->fromDate) {
            throw GetProductionException::invalidRange(fromDate: $query->fromDate, toDate: $query->toDate);
        }

        return $this->dataTransform->transform(
            proposal: $this->needleDataQuery->findProposal(
                fromDate: $query->fromDate,
                toDate: $query->toDate,
            ),
        );
    }
}
