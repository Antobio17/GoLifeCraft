<?php

namespace App\Tests\Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntrySeriesCommand;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntrySeriesCommandHandler;
use Agenda\Agenda\Agenda\Domain\Event\AgendaEntryCreated;
use Agenda\Agenda\Agenda\Domain\Exception\AgendaEntrySeriesException;
use Agenda\Agenda\Agenda\Domain\Exception\CreateAgendaEntryException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Infrastructure\Domain\Model\InMemory\InMemoryAgendaEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateAgendaEntrySeriesCommandHandlerTest extends TestCase
{
    private InMemoryAgendaEntryRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private CreateAgendaEntrySeriesCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryAgendaEntryRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new CreateAgendaEntrySeriesCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesOneEntryPerDayOfTheRange(): void
    {
        ($this->handler)(new CreateAgendaEntrySeriesCommand(
            entryDate: '2026-07-27',
            endDate: '2026-07-29',
            title: '  Tomar la pastilla  ',
            kind: AgendaEntry::KIND_TASK,
            category: 'health',
            notes: 'Con el desayuno.',
            createdByUserId: 'god-user-id',
        ));

        $entries = $this->repository->findBySeriesId(seriesId: 'agenda-entry-1');

        $this->assertCount(expectedCount: 3, haystack: $entries);
        $this->assertSame(
            expected: ['2026-07-27', '2026-07-28', '2026-07-29'],
            actual: array_map(static fn (AgendaEntry $entry) => $entry->entryDate, $entries),
        );

        foreach ($entries as $entry) {
            $this->assertSame(expected: 'Tomar la pastilla', actual: $entry->title);
            $this->assertNull(actual: $entry->time);
            $this->assertSame(expected: 'health', actual: $entry->category);
            $this->assertFalse(condition: $entry->done);
        }
    }

    public function testEveryEntryOfTheSeriesHasItsOwnIdAndSharesTheSeriesId(): void
    {
        ($this->handler)(new CreateAgendaEntrySeriesCommand(
            entryDate: '2026-07-27',
            endDate: '2026-07-29',
            title: 'Tomar la pastilla',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));

        $entries = $this->repository->findBySeriesId(seriesId: 'agenda-entry-1');
        $ids = array_map(static fn (AgendaEntry $entry) => $entry->id, $entries);

        $this->assertSame(expected: $ids, actual: array_unique(array: $ids));
        $this->assertNotContains(needle: 'agenda-entry-1', haystack: $ids);
    }

    public function testItRegistersOneCreatedEventPerEntry(): void
    {
        ($this->handler)(new CreateAgendaEntrySeriesCommand(
            entryDate: '2026-07-27',
            endDate: '2026-07-29',
            title: 'Tomar la pastilla',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertCount(expectedCount: 3, haystack: $events);
        $this->assertContainsOnlyInstancesOf(className: AgendaEntryCreated::class, haystack: $events);
        $this->assertSame(expected: 'agenda-entry-1', actual: $events[0]->seriesId);
    }

    public function testASingleDayRangeCreatesOneEntryWithoutSeriesId(): void
    {
        ($this->handler)(new CreateAgendaEntrySeriesCommand(
            entryDate: '2026-07-27',
            endDate: '2026-07-27',
            title: 'Comprar fruta',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));

        $entry = $this->repository->findById(id: 'agenda-entry-1');

        $this->assertNotNull(actual: $entry);
        $this->assertSame(expected: '2026-07-27', actual: $entry->entryDate);
        $this->assertNull(actual: $entry->seriesId);
    }

    public function testItThrowsWhenEndDateIsBeforeStartDate(): void
    {
        $this->expectException(exception: AgendaEntrySeriesException::class);

        ($this->handler)(new CreateAgendaEntrySeriesCommand(
            entryDate: '2026-07-29',
            endDate: '2026-07-27',
            title: 'Tomar la pastilla',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenADateIsInvalid(): void
    {
        $this->expectException(exception: AgendaEntrySeriesException::class);

        ($this->handler)(new CreateAgendaEntrySeriesCommand(
            entryDate: '2026-07-27',
            endDate: '29-07-2026',
            title: 'Tomar la pastilla',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheRangeExceedsTheMaximumNumberOfDays(): void
    {
        $endDate = (new \DateTimeImmutable(datetime: '2026-07-27'))
            ->modify(modifier: sprintf('+%d days', AgendaEntry::SERIES_MAX_DAYS))
            ->format(format: 'Y-m-d');

        $this->expectException(exception: AgendaEntrySeriesException::class);

        ($this->handler)(new CreateAgendaEntrySeriesCommand(
            entryDate: '2026-07-27',
            endDate: $endDate,
            title: 'Tomar la pastilla',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItCreatesNothingWhenTheSharedDataIsInvalid(): void
    {
        try {
            ($this->handler)(new CreateAgendaEntrySeriesCommand(
                entryDate: '2026-07-27',
                endDate: '2026-07-29',
                title: '   ',
                kind: AgendaEntry::KIND_TASK,
                category: '',
                notes: '',
                createdByUserId: 'god-user-id',
            ));

            $this->fail(message: 'A CreateAgendaEntryException was expected.');
        } catch (CreateAgendaEntryException) {
            $this->assertSame(expected: [], actual: $this->repository->findBySeriesId(seriesId: 'agenda-entry-1'));
            $this->assertSame(expected: [], actual: $this->domainEventCollectorService->pullEvents());
        }
    }
}
