<?php

namespace App\Tests\Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Application\Command\UnreceiveTicketCommand;
use Nutrition\Shopping\Ticket\Application\Command\UnreceiveTicketCommandHandler;
use Nutrition\Shopping\Ticket\Domain\Event\TicketUnreceived;
use Nutrition\Shopping\Ticket\Domain\Exception\UnreceiveTicketException;
use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\Model\TicketLineDraft;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRawLine;
use Nutrition\Shopping\Ticket\Infrastructure\Domain\Model\InMemory\InMemoryTicketRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UnreceiveTicketCommandHandlerTest extends TestCase
{
    private InMemoryTicketRepository $ticketRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private UnreceiveTicketCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->ticketRepository = new InMemoryTicketRepository();
        $this->handler = new UnreceiveTicketCommandHandler(
            ticketRepository: $this->ticketRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItPutsTheTicketBackOnTheTableAndSaysWhatToReturn(): void
    {
        $ticket = $this->givenReceivedTicket();

        ($this->handler)(new UnreceiveTicketCommand(ticketId: 'ticket-1', unreceivedByUserId: 'god-user-id'));

        $stored = $this->ticketRepository->findById(id: 'ticket-1');

        /** @var TicketUnreceived $unreceived */
        $unreceived = array_values(array: array_filter(
            array: $ticket->pullDomainEvents(),
            callback: static fn (object $event): bool => $event instanceof TicketUnreceived,
        ))[0];

        $this->assertSame(expected: Ticket::STATUS_DRAFT, actual: $stored->status);
        $this->assertFalse(condition: $stored->items[0]->isReceived());
        $this->assertFalse(condition: $stored->items[1]->isReceived());
        $this->assertSame(
            expected: [$ticket->items[0]->id, $ticket->items[1]->id],
            actual: $unreceived->returnedItemIds,
        );
        $this->assertSame(
            expected: 2000.0,
            actual: $unreceived->items[0]['baseQuantity'],
        );
    }

    public function testItLetsTheTicketBeReceivedAgain(): void
    {
        $ticket = $this->givenReceivedTicket();

        ($this->handler)(new UnreceiveTicketCommand(ticketId: 'ticket-1', unreceivedByUserId: 'god-user-id'));

        $ticket->receive(receivedByUserId: 'god-user-id', dateTimeGenerator: $this->dateTimeGenerator);

        $this->assertSame(expected: Ticket::STATUS_RECEIVED, actual: $ticket->status);
    }

    public function testItRefusesATicketThatWasNeverReceived(): void
    {
        $this->givenDraftTicket();

        $this->expectException(exception: UnreceiveTicketException::class);

        ($this->handler)(new UnreceiveTicketCommand(ticketId: 'ticket-1', unreceivedByUserId: 'god-user-id'));
    }

    public function testItRefusesAnUnknownTicket(): void
    {
        $this->expectException(exception: UnreceiveTicketException::class);

        ($this->handler)(new UnreceiveTicketCommand(ticketId: 'missing-ticket', unreceivedByUserId: 'god-user-id'));
    }

    private function givenReceivedTicket(): Ticket
    {
        $ticket = $this->givenDraftTicket();

        $ticket->receive(receivedByUserId: 'god-user-id', dateTimeGenerator: $this->dateTimeGenerator);
        $ticket->pullDomainEvents();

        $this->ticketRepository->save(ticket: $ticket);

        return $ticket;
    }

    private function givenDraftTicket(): Ticket
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
