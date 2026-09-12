<?php

namespace App\Tests\Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Application\Command\CreateTicketCommand;
use Nutrition\Shopping\Ticket\Application\Command\CreateTicketCommandHandler;
use Nutrition\Shopping\Ticket\Domain\Exception\CreateTicketException;
use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\Service\TicketLineDrafter;
use Nutrition\Shopping\Ticket\Domain\Service\TicketLineMatcher;
use Nutrition\Shopping\Ticket\Infrastructure\Domain\Model\InMemory\InMemoryTicketRepository;
use Nutrition\Shopping\Ticket\Infrastructure\Domain\QueryModel\InMemory\InMemoryAddTicketLinesNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateTicketCommandHandlerTest extends TestCase
{
    private InMemoryTicketRepository $ticketRepository;
    private InMemoryAddTicketLinesNeedleDataQuery $needleDataQuery;
    private DateTimeGenerator $dateTimeGenerator;
    private CreateTicketCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->ticketRepository = new InMemoryTicketRepository();
        $this->needleDataQuery = new InMemoryAddTicketLinesNeedleDataQuery();
        $this->handler = new CreateTicketCommandHandler(
            ticketRepository: $this->ticketRepository,
            ticketLineDrafter: new TicketLineDrafter(
                needleDataQuery: $this->needleDataQuery,
                ticketLineMatcher: new TicketLineMatcher(),
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItOpensADraftTicketWithItsLines(): void
    {
        ($this->handler)($this->command(lines: [
            TicketTestPaper::line(rawName: 'LECHE DESNAT. BRIK 1L', quantity: 6.0, unitPrice: 0.95),
            TicketTestPaper::line(rawName: 'ARROZ REDONDO 1KG', quantity: 1.0, unitPrice: 1.25),
        ]));

        $ticket = $this->ticketRepository->findById(id: 'ticket-scanned');

        $this->assertSame(expected: Ticket::STATUS_DRAFT, actual: $ticket->status);
        $this->assertSame(expected: 'MERCADONA S.A.', actual: $ticket->storeName);
        $this->assertSame(expected: '2026-09-11', actual: $ticket->purchasedOn);
        $this->assertSame(expected: 12.45, actual: $ticket->total);
        $this->assertCount(expectedCount: 2, haystack: $ticket->items);
        $this->assertSame(expected: 1, actual: $ticket->items[0]->position);
        $this->assertSame(expected: 2, actual: $ticket->items[1]->position);
    }

    public function testItLinksTheLinesTheCatalogRecognises(): void
    {
        $this->needleDataQuery->withCandidate(candidate: TicketTestPaper::milk());

        ($this->handler)($this->command(lines: [
            TicketTestPaper::line(rawName: 'LECHE DESNATADA', quantity: 6.0, unitPrice: 0.95),
        ]));

        $item = $this->ticketRepository->findById(id: 'ticket-scanned')->items[0];

        $this->assertSame(expected: 'article-milk', actual: $item->articleId);
        $this->assertSame(expected: TicketItem::LINK_SOURCE_CATALOG, actual: $item->linkSource);
        $this->assertSame(expected: 6000.0, actual: $item->baseQuantity);
    }

    public function testItLeavesAnUnknownLineWaitingForAHuman(): void
    {
        ($this->handler)($this->command(lines: [
            TicketTestPaper::line(rawName: 'CHOCO NEGRO 85%', quantity: 2.0, unitPrice: 1.1),
        ]));

        $item = $this->ticketRepository->findById(id: 'ticket-scanned')->items[0];

        $this->assertNull(actual: $item->articleId);
        $this->assertSame(expected: 2.2, actual: $item->totalPrice);
    }

    public function testItRejectsATicketWithoutLines(): void
    {
        $this->expectException(exception: CreateTicketException::class);

        ($this->handler)($this->command(lines: []));
    }

    public function testItRejectsAPurchaseDayThatIsNotADate(): void
    {
        $this->expectException(exception: CreateTicketException::class);

        ($this->handler)($this->command(
            lines: [TicketTestPaper::line(rawName: 'ARROZ', quantity: 1.0)],
            purchasedOn: '11/09/2026',
        ));
    }

    public function testItRejectsATicketThatAlreadyExists(): void
    {
        $this->ticketRepository->save(ticket: TicketTestPaper::ticket(
            id: 'ticket-scanned',
            supermarketId: 'supermarket-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));

        $this->expectException(exception: CreateTicketException::class);

        ($this->handler)($this->command(
            lines: [TicketTestPaper::line(rawName: 'ARROZ', quantity: 1.0)],
        ));
    }

    /**
     * @param array<int, array<string, mixed>> $lines
     */
    private function command(array $lines, string $purchasedOn = '2026-09-11'): CreateTicketCommand
    {
        return new CreateTicketCommand(
            ticketId: 'ticket-scanned',
            storeName: 'MERCADONA S.A.',
            supermarketId: 'supermarket-1',
            purchasedOn: $purchasedOn,
            total: 12.45,
            note: '',
            lines: $lines,
            createdByUserId: 'god-user-id',
        );
    }
}
