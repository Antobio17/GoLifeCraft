<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Domain\Exception\AddTicketLinesException;
use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\Model\TicketLineDraft;
use Nutrition\Shopping\Ticket\Domain\Model\TicketLineName;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRawLine;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRepository;
use Nutrition\Shopping\Ticket\Domain\QueryModel\AddTicketLinesNeedleDataQuery;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;
use Nutrition\Shopping\Ticket\Domain\Service\TicketLineMatcher;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class AddTicketLinesCommandHandler
{
    public function __construct(
        private TicketRepository $ticketRepository,
        private AddTicketLinesNeedleDataQuery $needleDataQuery,
        private TicketLineMatcher $ticketLineMatcher,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(AddTicketLinesCommand $command): void
    {
        $ticket = $this->ticketRepository->findById(id: $command->ticketId);

        if (null === $ticket) {
            throw AddTicketLinesException::notFound(ticketId: $command->ticketId);
        }

        $ticket->addLines(
            drafts: $this->draftsFor(lines: $command->lines, supermarketId: $ticket->supermarketId),
            addedByUserId: $command->addedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->ticketRepository->save(ticket: $ticket);
        $this->domainEventCollectorService->register(aggregate: $ticket);
    }

    /**
     * @param array<int, array<string, mixed>> $lines
     *
     * @return TicketLineDraft[]
     */
    private function draftsFor(array $lines, ?string $supermarketId): array
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
