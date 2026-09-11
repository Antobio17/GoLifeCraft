<?php

namespace App\Tests\Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Application\Command\ReceiveTicketCommand;
use Nutrition\Shopping\Ticket\Application\Command\ReceiveTicketCommandHandler;
use Nutrition\Shopping\Ticket\Application\Command\RemoveTicketItemCommand;
use Nutrition\Shopping\Ticket\Application\Command\RemoveTicketItemCommandHandler;
use Nutrition\Shopping\Ticket\Domain\Event\TicketItemRemoved;
use Nutrition\Shopping\Ticket\Domain\Exception\RemoveTicketItemException;
use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\Model\TicketLineDraft;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRawLine;
use Nutrition\Shopping\Ticket\Infrastructure\Domain\Model\InMemory\InMemoryTicketRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class RemoveTicketItemCommandHandlerTest extends TestCase
{
    private InMemoryTicketRepository $ticketRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private RemoveTicketItemCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->ticketRepository = new InMemoryTicketRepository();
        $this->handler = new RemoveTicketItemCommandHandler(
            ticketRepository: $this->ticketRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItDropsTheLineAndKeepsWhatItSaid(): void
    {
        $ticket = $this->givenTicket();
        $removedId = $ticket->items[1]->id;

        ($this->handler)(new RemoveTicketItemCommand(
            ticketId: 'ticket-1',
            itemId: $removedId,
            removedByUserId: 'god-user-id',
        ));

        /** @var TicketItemRemoved $removed */
        $removed = array_values(array: array_filter(
            array: $ticket->pullDomainEvents(),
            callback: static fn (object $event): bool => $event instanceof TicketItemRemoved,
        ))[0];

        $this->assertCount(expectedCount: 1, haystack: $this->ticketRepository->findById(id: 'ticket-1')->items);
        $this->assertNull(actual: $ticket->item(itemId: $removedId));
        $this->assertSame(expected: 'ARROZ REDONDO', actual: $removed->rawName);
        $this->assertCount(expectedCount: 1, haystack: $removed->items);
    }

    public function testItRefusesALineAlreadyInThePantry(): void
    {
        $ticket = $this->givenTicket();

        (new ReceiveTicketCommandHandler(
            ticketRepository: $this->ticketRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        ))(new ReceiveTicketCommand(ticketId: 'ticket-1', receivedByUserId: 'god-user-id'));

        $this->expectException(exception: RemoveTicketItemException::class);

        ($this->handler)(new RemoveTicketItemCommand(
            ticketId: 'ticket-1',
            itemId: $ticket->items[0]->id,
            removedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownLine(): void
    {
        $this->givenTicket();

        $this->expectException(exception: RemoveTicketItemException::class);

        ($this->handler)(new RemoveTicketItemCommand(
            ticketId: 'ticket-1',
            itemId: 'missing-item',
            removedByUserId: 'god-user-id',
        ));
    }

    private function givenTicket(): Ticket
    {
        $ticket = TicketTestPaper::ticket(
            id: 'ticket-1',
            supermarketId: 'supermarket-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $ticket->addLines(
            drafts: [
                new TicketLineDraft(
                    rawLine: TicketRawLine::fromArray(line: TicketTestPaper::line(
                        rawName: 'LECHE DESNAT. BRIK 1L',
                        quantity: 2.0,
                        unitPrice: 0.95,
                    )),
                    link: TicketTestPaper::milk()->toLink(),
                    linkSource: TicketItem::LINK_SOURCE_MEMORY,
                ),
                new TicketLineDraft(
                    rawLine: TicketRawLine::fromArray(line: TicketTestPaper::line(
                        rawName: 'ARROZ REDONDO',
                        quantity: 1.0,
                        unitPrice: 1.20,
                    )),
                    link: TicketTestPaper::rice()->toLink(),
                    linkSource: TicketItem::LINK_SOURCE_CATALOG,
                ),
            ],
            addedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $ticket->pullDomainEvents();

        $this->ticketRepository->save(ticket: $ticket);

        return $ticket;
    }
}
