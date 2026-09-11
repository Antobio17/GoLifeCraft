<?php

namespace Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Domain\Exception\LinkTicketItemException;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRepository;
use Nutrition\Shopping\Ticket\Domain\QueryModel\LinkTicketItemNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class LinkTicketItemCommandHandler
{
    public function __construct(
        private TicketRepository $ticketRepository,
        private LinkTicketItemNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(LinkTicketItemCommand $command): void
    {
        $ticket = $this->ticketRepository->findById(id: $command->ticketId);

        if (null === $ticket) {
            throw LinkTicketItemException::notFound(ticketId: $command->ticketId);
        }

        $article = $this->needleDataQuery->findArticle(articleId: $command->articleId);

        if (null === $article) {
            throw LinkTicketItemException::articleNotFound(articleId: $command->articleId);
        }

        $ticket->linkItem(
            itemId: $command->itemId,
            article: $article->toLink(),
            linkedByUserId: $command->linkedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->ticketRepository->save(ticket: $ticket);
        $this->domainEventCollectorService->register(aggregate: $ticket);
    }
}
