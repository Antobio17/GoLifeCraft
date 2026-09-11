<?php

namespace Nutrition\Shopping\Ticket\Domain\QueryModel;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;

interface LinkTicketItemNeedleDataQuery
{
    public function findArticle(string $articleId): ?TicketArticleCandidate;
}
