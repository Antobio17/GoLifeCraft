<?php

namespace Nutrition\Shopping\Ticket\Domain\Service;

use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\Model\TicketLineDraft;
use Nutrition\Shopping\Ticket\Domain\Model\TicketLineName;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRawLine;
use Nutrition\Shopping\Ticket\Domain\QueryModel\AddTicketLinesNeedleDataQuery;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;

final readonly class TicketLineDrafter
{
    public function __construct(
        private AddTicketLinesNeedleDataQuery $needleDataQuery,
        private TicketLineMatcher $ticketLineMatcher,
    ) {
    }

    /**
     * @param array<int, array<string, mixed>> $lines
     *
     * @return TicketLineDraft[]
     */
    public function draftsFor(array $lines, ?string $supermarketId): array
    {
        $candidates = $this->needleDataQuery->findCandidates();
        $candidatesById = [];

        foreach ($candidates as $candidate) {
            $candidatesById[$candidate->articleId] = $candidate;
        }

        $drafts = [];

        foreach ($lines as $line) {
            $drafts[] = $this->draftFor(
                rawLine: TicketRawLine::fromArray(line: $line),
                supermarketId: $supermarketId,
                candidates: $candidates,
                candidatesById: $candidatesById,
            );
        }

        return $drafts;
    }

    /**
     * @param TicketArticleCandidate[]              $candidates
     * @param array<string, TicketArticleCandidate> $candidatesById
     */
    private function draftFor(
        TicketRawLine $rawLine,
        ?string $supermarketId,
        array $candidates,
        array $candidatesById,
    ): TicketLineDraft {
        $rememberedArticleId = $this->needleDataQuery->findRememberedArticleId(
            normalizedName: TicketLineName::normalize(value: $rawLine->rawName),
            supermarketId: $supermarketId,
        );

        if (null !== $rememberedArticleId && isset($candidatesById[$rememberedArticleId])) {
            return new TicketLineDraft(
                rawLine: $rawLine,
                link: $candidatesById[$rememberedArticleId]->toLink(),
                linkSource: TicketItem::LINK_SOURCE_MEMORY,
            );
        }

        $match = $this->ticketLineMatcher->bestMatch(rawName: $rawLine->rawName, candidates: $candidates);

        if (null === $match || !isset($candidatesById[$match->articleId])) {
            return new TicketLineDraft(rawLine: $rawLine, link: null);
        }

        return new TicketLineDraft(
            rawLine: $rawLine,
            link: $candidatesById[$match->articleId]->toLink(),
            linkSource: TicketItem::LINK_SOURCE_CATALOG,
        );
    }
}
