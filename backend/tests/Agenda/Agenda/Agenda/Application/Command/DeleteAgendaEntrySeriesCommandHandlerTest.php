<?php

namespace App\Tests\Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntryCommand;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntryCommandHandler;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntrySeriesCommand;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntrySeriesCommandHandler;
use Agenda\Agenda\Agenda\Application\Command\DeleteAgendaEntrySeriesCommand;
use Agenda\Agenda\Agenda\Application\Command\DeleteAgendaEntrySeriesCommandHandler;
use Agenda\Agenda\Agenda\Domain\Event\AgendaEntryDeleted;
use Agenda\Agenda\Agenda\Domain\Exception\DeleteAgendaEntrySeriesException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Infrastructure\Domain\Model\InMemory\InMemoryAgendaEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteAgendaEntrySeriesCommandHandlerTest extends TestCase
{
    private const string SERIES_ID = 'agenda-entry-1';
    private const string STANDALONE_ENTRY_ID = 'agenda-entry-5';

    private InMemoryAgendaEntryRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private DeleteAgendaEntrySeriesCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryAgendaEntryRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $dateTimeGenerator = new DateTimeGenerator();

        $createSeriesHandler = new CreateAgendaEntrySeriesCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );

        ($createSeriesHandler)(new CreateAgendaEntrySeriesCommand(
            entryDate: '2026-07-27',
            endDate: '2026-07-29',
            title: 'Tomar la pastilla',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));

        $createHandler = new CreateAgendaEntryCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );

        ($createHandler)(new CreateAgendaEntryCommand(
            entryDate: '2026-07-28',
            time: null,
            title: 'Comprar fruta',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));

        $this->domainEventCollectorService->pullEvents();

        $this->handler = new DeleteAgendaEntrySeriesCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItDeletesEveryEntryOfTheSeries(): void
    {
        ($this->handler)(new DeleteAgendaEntrySeriesCommand(
            seriesId: self::SERIES_ID,
            deletedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: [],
            actual: $this->repository->findBySeriesId(seriesId: self::SERIES_ID),
        );
    }

    public function testItLeavesTheEntriesOutsideTheSeriesUntouched(): void
    {
        ($this->handler)(new DeleteAgendaEntrySeriesCommand(
            seriesId: self::SERIES_ID,
            deletedByUserId: 'god-user-id',
        ));

        $standalone = $this->repository->findById(id: self::STANDALONE_ENTRY_ID);

        $this->assertNotNull(actual: $standalone);
        $this->assertSame(expected: 'Comprar fruta', actual: $standalone->title);
        $this->assertNull(actual: $standalone->seriesId);
    }

    public function testItRegistersOneDeletedEventPerEntry(): void
    {
        ($this->handler)(new DeleteAgendaEntrySeriesCommand(
            seriesId: self::SERIES_ID,
            deletedByUserId: 'god-user-id',
        ));

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertCount(expectedCount: 3, haystack: $events);
        $this->assertContainsOnlyInstancesOf(className: AgendaEntryDeleted::class, haystack: $events);
    }

    public function testItThrowsWhenTheSeriesDoesNotExist(): void
    {
        $this->expectException(exception: DeleteAgendaEntrySeriesException::class);

        ($this->handler)(new DeleteAgendaEntrySeriesCommand(
            seriesId: 'unknown-series',
            deletedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnEmptySeriesIdWithoutTouchingAnyEntry(): void
    {
        try {
            ($this->handler)(new DeleteAgendaEntrySeriesCommand(
                seriesId: '',
                deletedByUserId: 'god-user-id',
            ));

            $this->fail(message: 'A DeleteAgendaEntrySeriesException was expected.');
        } catch (DeleteAgendaEntrySeriesException) {
            $this->assertCount(expectedCount: 3, haystack: $this->repository->findBySeriesId(seriesId: self::SERIES_ID));
            $this->assertNotNull(actual: $this->repository->findById(id: self::STANDALONE_ENTRY_ID));
        }
    }
}
