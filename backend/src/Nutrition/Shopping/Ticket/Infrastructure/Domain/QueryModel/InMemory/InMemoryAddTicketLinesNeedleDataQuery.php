<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Shopping\Ticket\Domain\QueryModel\AddTicketLinesNeedleDataQuery;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;

final class InMemoryAddTicketLinesNeedleDataQuery implements AddTicketLinesNeedleDataQuery
{
    /** @var TicketArticleCandidate[] */
    private array $candidates = [];

    /** @var array<string, string> */
    private array $rememberedArticleIds = [];

    public function withCandidate(TicketArticleCandidate $candidate): void
    {
        $this->candidates[] = $candidate;
    }

    public function withRememberedArticle(string $normalizedName, ?string $supermarketId, string $articleId): void
    {
        $this->rememberedArticleIds[$normalizedName.'|'.($supermarketId ?? '')] = $articleId;
    }

    public function findRememberedArticleId(string $normalizedName, ?string $supermarketId): ?string
    {
        return $this->rememberedArticleIds[$normalizedName.'|'.($supermarketId ?? '')]
            ?? $this->rememberedArticleIds[$normalizedName.'|']
            ?? null;
    }

    public function findCandidates(): array
    {
        return $this->candidates;
    }
}
