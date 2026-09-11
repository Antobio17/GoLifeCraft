<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;
use Nutrition\Shopping\Ticket\Domain\QueryModel\LinkTicketItemNeedleDataQuery;

final class InMemoryLinkTicketItemNeedleDataQuery implements LinkTicketItemNeedleDataQuery
{
    /** @var array<string, TicketArticleCandidate> */
    private array $articles = [];

    public function withArticle(TicketArticleCandidate $article): void
    {
        $this->articles[$article->articleId] = $article;
    }

    public function findArticle(string $articleId): ?TicketArticleCandidate
    {
        return $this->articles[$articleId] ?? null;
    }
}
