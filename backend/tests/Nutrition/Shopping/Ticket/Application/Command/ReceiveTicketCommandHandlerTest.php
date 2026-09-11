<?php

namespace App\Tests\Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Application\Command\ReceiveTicketCommand;
use Nutrition\Shopping\Ticket\Application\Command\ReceiveTicketCommandHandler;
use Nutrition\Shopping\Ticket\Domain\Event\TicketReceived;
use Nutrition\Shopping\Ticket\Domain\Exception\ReceiveTicketException;
use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\Model\TicketLineDraft;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRawLine;
use Nutrition\Shopping\Ticket\Infrastructure\Domain\Model\InMemory\InMemoryTicketRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ReceiveTicketCommandHandlerTest extends TestCase
{
    private InMemoryTicketRepository $ticketRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private ReceiveTicketCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->ticketRepository = new InMemoryTicketRepository();
        $this->handler = new ReceiveTicketCommandHandler(
            ticketRepository: $this->ticketRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItTurnsTheLinkedLinesIntoHistory(): void
    {
        $ticket = $this->givenTicket(milkLinked: true, riceLinked: true);

        ($this->handler)(new ReceiveTicketCommand(ticketId: 'ticket-1', receivedByUserId: 'god-user-id'));

        $stored = $this->ticketRepository->findById(id: 'ticket-1');

        /** @var TicketReceived $received */
        $received = array_values(array: array_filter(
            array: $ticket->pullDomainEvents(),
            callback: static fn (object $event): bool => $event instanceof TicketReceived,
        ))[0];

        $this->assertSame(expected: Ticket::STATUS_RECEIVED, actual: $stored->status);
        $this->assertTrue(condition: $stored->items[0]->isReceived());
        $this->assertTrue(condition: $stored->items[1]->isReceived());
        $this->assertSame(
            expected: [$ticket->items[0]->id, $ticket->items[1]->id],
            actual: $received->receivedItemIds,
        );
    }

    public function testItRefusesWhenALineIsStillUnlinked(): void
    {
        $this->givenTicket(milkLinked: true, riceLinked: false);

        $this->expectException(exception: ReceiveTicketException::class);

        ($this->handler)(new ReceiveTicketCommand(ticketId: 'ticket-1', receivedByUserId: 'god-user-id'));
    }

    public function testItRefusesToReceiveWithNothingLinked(): void
    {
        $this->givenTicket(milkLinked: false, riceLinked: false);

        $this->expectException(exception: ReceiveTicketException::class);

        ($this->handler)(new ReceiveTicketCommand(ticketId: 'ticket-1', receivedByUserId: 'god-user-id'));
    }

    public function testItRefusesToReceiveTwice(): void
    {
        $this->givenTicket(milkLinked: true, riceLinked: true);

        ($this->handler)(new ReceiveTicketCommand(ticketId: 'ticket-1', receivedByUserId: 'god-user-id'));

        $this->expectException(exception: ReceiveTicketException::class);

        ($this->handler)(new ReceiveTicketCommand(ticketId: 'ticket-1', receivedByUserId: 'god-user-id'));
    }

    public function testItRefusesAnUnknownTicket(): void
    {
        $this->expectException(exception: ReceiveTicketException::class);

        ($this->handler)(new ReceiveTicketCommand(ticketId: 'missing-ticket', receivedByUserId: 'god-user-id'));
    }

    private function givenTicket(bool $milkLinked, bool $riceLinked): Ticket
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
                    link: $milkLinked ? TicketTestPaper::milk()->toLink() : null,
                    linkSource: $milkLinked ? TicketItem::LINK_SOURCE_MEMORY : null,
                ),
                new TicketLineDraft(
                    rawLine: TicketRawLine::fromArray(line: TicketTestPaper::line(
                        rawName: 'ARROZ REDONDO',
                        quantity: 1.0,
                        unitPrice: 1.20,
                    )),
                    link: $riceLinked ? TicketTestPaper::rice()->toLink() : null,
                    linkSource: $riceLinked ? TicketItem::LINK_SOURCE_CATALOG : null,
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
