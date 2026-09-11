<?php

namespace App\Tests\Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Application\Command\LinkTicketItemCommand;
use Nutrition\Shopping\Ticket\Application\Command\LinkTicketItemCommandHandler;
use Nutrition\Shopping\Ticket\Domain\Event\TicketItemLinked;
use Nutrition\Shopping\Ticket\Domain\Exception\LinkTicketItemException;
use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\Model\TicketLineDraft;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRawLine;
use Nutrition\Shopping\Ticket\Infrastructure\Domain\Model\InMemory\InMemoryTicketRepository;
use Nutrition\Shopping\Ticket\Infrastructure\Domain\QueryModel\InMemory\InMemoryLinkTicketItemNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class LinkTicketItemCommandHandlerTest extends TestCase
{
    private InMemoryTicketRepository $ticketRepository;
    private InMemoryLinkTicketItemNeedleDataQuery $needleDataQuery;
    private DateTimeGenerator $dateTimeGenerator;
    private LinkTicketItemCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->ticketRepository = new InMemoryTicketRepository();
        $this->needleDataQuery = new InMemoryLinkTicketItemNeedleDataQuery();
        $this->needleDataQuery->withArticle(article: TicketTestPaper::milk());
        $this->handler = new LinkTicketItemCommandHandler(
            ticketRepository: $this->ticketRepository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItLinksTheLineToTheChosenArticle(): void
    {
        $ticket = $this->givenTicketWithALine();

        ($this->handler)(new LinkTicketItemCommand(
            ticketId: 'ticket-1',
            itemId: $ticket->items[0]->id,
            articleId: 'article-milk',
            linkedByUserId: 'god-user-id',
        ));

        $item = $this->ticketRepository->findById(id: 'ticket-1')->items[0];

        $this->assertSame(expected: 'article-milk', actual: $item->articleId);
        $this->assertSame(expected: TicketItem::LINK_SOURCE_MANUAL, actual: $item->linkSource);
        $this->assertSame(expected: 'Leche desnatada', actual: $item->articleNameSnapshot);
        $this->assertSame(expected: 2000.0, actual: $item->baseQuantity);
    }

    public function testItRecordsWhatTheLineSaidSoTheMemoryCanLearnIt(): void
    {
        $ticket = $this->givenTicketWithALine();

        ($this->handler)(new LinkTicketItemCommand(
            ticketId: 'ticket-1',
            itemId: $ticket->items[0]->id,
            articleId: 'article-milk',
            linkedByUserId: 'god-user-id',
        ));

        $events = array_filter(
            array: $ticket->pullDomainEvents(),
            callback: static fn (object $event): bool => $event instanceof TicketItemLinked,
        );

        /** @var TicketItemLinked $linked */
        $linked = array_values(array: $events)[0];

        $this->assertSame(expected: 'LECHE DESNAT. BRIK 1L', actual: $linked->rawName);
        $this->assertSame(expected: 'supermarket-1', actual: $linked->supermarketId);
        $this->assertSame(expected: 'article-milk', actual: $linked->articleId);
    }

    public function testItRefusesAnArticleThatDoesNotExist(): void
    {
        $ticket = $this->givenTicketWithALine();

        $this->expectException(exception: LinkTicketItemException::class);

        ($this->handler)(new LinkTicketItemCommand(
            ticketId: 'ticket-1',
            itemId: $ticket->items[0]->id,
            articleId: 'missing-article',
            linkedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownLine(): void
    {
        $this->givenTicketWithALine();

        $this->expectException(exception: LinkTicketItemException::class);

        ($this->handler)(new LinkTicketItemCommand(
            ticketId: 'ticket-1',
            itemId: 'missing-item',
            articleId: 'article-milk',
            linkedByUserId: 'god-user-id',
        ));
    }

    private function givenTicketWithALine(): Ticket
    {
        $ticket = TicketTestPaper::ticket(
            id: 'ticket-1',
            supermarketId: 'supermarket-1',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $ticket->addLines(
            drafts: [new TicketLineDraft(
                rawLine: TicketRawLine::fromArray(line: TicketTestPaper::line(
                    rawName: 'LECHE DESNAT. BRIK 1L',
                    quantity: 2.0,
                    unitPrice: 0.95,
                )),
                link: null,
            )],
            addedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->ticketRepository->save(ticket: $ticket);

        return $ticket;
    }
}
