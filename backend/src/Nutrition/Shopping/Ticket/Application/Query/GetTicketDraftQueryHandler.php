<?php

namespace Nutrition\Shopping\Ticket\Application\Query;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\GetTicketDraftResult;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftExtraction;
use Nutrition\Shopping\Ticket\Domain\QueryModel\TicketDraftGroundingNeedleDataQuery;
use Nutrition\Shopping\Ticket\Domain\Service\TicketDraftExtractor;
use Nutrition\Shopping\Ticket\Domain\Service\TicketDraftQuotaGuard;
use Nutrition\Shopping\Ticket\Domain\Service\TicketDraftStore;

final readonly class GetTicketDraftQueryHandler
{
    public function __construct(
        private TicketDraftGroundingNeedleDataQuery $needleDataQuery,
        private TicketDraftExtractor $ticketDraftExtractor,
        private TicketDraftQuotaGuard $quotaGuard,
        private TicketDraftStore $ticketDraftStore,
    ) {
    }

    public function __invoke(GetTicketDraftQuery $query): GetTicketDraftResult
    {
        $remembered = $this->ticketDraftStore->find(userId: $query->userSessionId, photos: $query->photos);

        if (null !== $remembered) {
            return $this->resultOf(extraction: $remembered, fromCache: true);
        }

        $this->quotaGuard->consume(userId: $query->userSessionId);

        $extraction = $this->ticketDraftExtractor->extract(
            photos: $query->photos,
            grounding: $this->needleDataQuery->load(),
        );

        if (!$extraction->isSuccessful()) {
            return $this->resultOf(extraction: $extraction, fromCache: false);
        }

        $this->ticketDraftStore->keep(
            userId: $query->userSessionId,
            photos: $query->photos,
            extraction: $extraction,
        );

        return $this->resultOf(extraction: $extraction, fromCache: false);
    }

    private function resultOf(TicketDraftExtraction $extraction, bool $fromCache): GetTicketDraftResult
    {
        return new GetTicketDraftResult(
            draft: $extraction->draft,
            fromCache: $fromCache,
            lowConfidenceFields: $extraction->lowConfidenceFields,
            notes: $extraction->notes,
        );
    }
}
