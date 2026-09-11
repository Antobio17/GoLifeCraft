<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;

interface AddTicketLinesNeedleDataQuery
{
    public function findRememberedArticleId(string $normalizedName, ?string $supermarketId): ?string;

    /**
     * @return TicketArticleCandidate[]
     */
    public function findCandidates(): array;
}
