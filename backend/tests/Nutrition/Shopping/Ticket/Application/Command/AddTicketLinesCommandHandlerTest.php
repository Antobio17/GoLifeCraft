<?php

namespace App\Tests\Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Application\Command\AddTicketLinesCommand;
use Nutrition\Shopping\Ticket\Application\Command\AddTicketLinesCommandHandler;
use Nutrition\Shopping\Ticket\Domain\Exception\AddTicketLinesException;
use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\Service\TicketLineMatcher;
use Nutrition\Shopping\Ticket\Infrastructure\Domain\Model\InMemory\InMemoryTicketRepository;
use Nutrition\Shopping\Ticket\Infrastructure\Domain\QueryModel\InMemory\InMemoryAddTicketLinesNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class AddTicketLinesCommandHandlerTest extends TestCase
{
    private InMemoryTicketRepository $ticketRepository;
    private InMemoryAddTicketLinesNeedleDataQuery $needleDataQuery;
    private DateTimeGenerator $dateTimeGenerator;
    private AddTicketLinesCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->ticketRepository = new InMemoryTicketRepository();
        $this->needleDataQuery = new InMemoryAddTicketLinesNeedleDataQuery();
        $this->handler = new AddTicketLinesCommandHandler(
            ticketRepository: $this->ticketRepository,
            needleDataQuery: $this->needleDataQuery,
            ticketLineMatcher: new TicketLineMatcher(),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItLinksALineTheMemoryAlreadyKnows(): void
    {
        $this->givenTicket();
        $this->needleDataQuery->withCandidate(candidate: TicketTestPaper::milk());
        $this->needleDataQuery->withRememberedArticle(
            normalizedName: 'lechedesnatbrik1l',
            supermarketId: 'supermarket-1',
            articleId: 'article-milk',
        );

        ($this->handler)(new AddTicketLinesCommand(
            ticketId: 'ticket-1',
            lines: [TicketTestPaper::line(rawName: 'LECHE DESNAT. BRIK 1L', quantity: 6.0, unitPrice: 0.95)],
            addedByUserId: 'god-user-id',
        ));

        $item = $this->ticketRepository->findById(id: 'ticket-1')->items[0];

        $this->assertSame(expected: 'article-milk', actual: $item->articleId);
        $this->assertSame(expected: TicketItem::LINK_SOURCE_MEMORY, actual: $item->linkSource);
    }

    public function testItTurnsPackagesIntoBaseUnitsThroughThePackEquivalence(): void
    {
        $this->givenTicket();
        $this->needleDataQuery->withCandidate(candidate: TicketTestPaper::milk());
        $this->needleDataQuery->withRememberedArticle(
            normalizedName: 'lechedesnatbrik1l',
            supermarketId: 'supermarket-1',
            articleId: 'article-milk',
        );

        ($this->handler)(new AddTicketLinesCommand(
            ticketId: 'ticket-1',
            lines: [TicketTestPaper::line(rawName: 'LECHE DESNAT. BRIK 1L', quantity: 6.0, unitPrice: 0.95)],
            addedByUserId: 'god-user-id',
        ));

        $item = $this->ticketRepository->findById(id: 'ticket-1')->items[0];

        $this->assertSame(expected: 6000.0, actual: $item->baseQuantity);
        $this->assertSame(expected: 5.7, actual: $item->totalPrice);
    }

    public function testItLinksWhatTheCatalogRecognisesWithoutAsking(): void
    {
        $this->givenTicket();
        $this->needleDataQuery->withCandidate(candidate: TicketTestPaper::rice());

        ($this->handler)(new AddTicketLinesCommand(
            ticketId: 'ticket-1',
            lines: [TicketTestPaper::line(rawName: 'ARROZ REDONDO 1KG', quantity: 1.0, unitPrice: 1.20)],
            addedByUserId: 'god-user-id',
        ));

        $item = $this->ticketRepository->findById(id: 'ticket-1')->items[0];

        $this->assertSame(expected: 'article-rice', actual: $item->articleId);
        $this->assertSame(expected: TicketItem::LINK_SOURCE_CATALOG, actual: $item->linkSource);
        $this->assertSame(expected: 1.0, actual: $item->baseQuantity);
    }

    public function testItLeavesAnUnknownLineWaitingForAHuman(): void
    {
        $this->givenTicket();
        $this->needleDataQuery->withCandidate(candidate: TicketTestPaper::rice());

        ($this->handler)(new AddTicketLinesCommand(
            ticketId: 'ticket-1',
            lines: [TicketTestPaper::line(rawName: 'BOLSA PLASTICO', quantity: 1.0, unitPrice: 0.15)],
            addedByUserId: 'god-user-id',
        ));

        $item = $this->ticketRepository->findById(id: 'ticket-1')->items[0];

        $this->assertNull(actual: $item->articleId);
        $this->assertNull(actual: $item->linkSource);
    }

    public function testItWorksOutTheUnitPriceFromTheLineTotal(): void
    {
        $this->givenTicket();

        ($this->handler)(new AddTicketLinesCommand(
            ticketId: 'ticket-1',
            lines: [['rawName' => 'PLATANO', 'quantity' => 4.0, 'totalPrice' => 5.0]],
            addedByUserId: 'god-user-id',
        ));

        $item = $this->ticketRepository->findById(id: 'ticket-1')->items[0];

        $this->assertSame(expected: 1.25, actual: $item->unitPrice);
    }

    public function testItRefusesALineWithoutName(): void
    {
        $this->givenTicket();

        $this->expectException(exception: AddTicketLinesException::class);

        ($this->handler)(new AddTicketLinesCommand(
            ticketId: 'ticket-1',
            lines: [['rawName' => '   ', 'quantity' => 1.0]],
            addedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownTicket(): void
    {
        $this->expectException(exception: AddTicketLinesException::class);

        ($this->handler)(new AddTicketLinesCommand(
            ticketId: 'missing-ticket',
            lines: [TicketTestPaper::line(rawName: 'PLATANO', quantity: 1.0)],
            addedByUserId: 'god-user-id',
        ));
    }

    private function givenTicket(): Ticket
    {
        $ticket = TicketTestPaper::ticket(
            id: 'ticket-1',
            supermarketId: 'supermarket-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->ticketRepository->save(ticket: $ticket);

        return $ticket;
    }
}
