<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetProductionProposalResult extends QueryAggregateResult
{
    /**
     * @param ProposalToCookItem[]  $toCook
     * @param ProposalCoveredItem[] $covered
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $fromDate,
        public readonly string $toDate,
        public readonly int $days,
        public readonly array $toCook,
        public readonly array $covered,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
