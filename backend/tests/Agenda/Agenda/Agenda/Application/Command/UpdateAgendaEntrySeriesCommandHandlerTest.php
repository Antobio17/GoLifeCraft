<?php

namespace App\Tests\Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Application\Command\ChangeAgendaEntryStatusCommand;
use Agenda\Agenda\Agenda\Application\Command\ChangeAgendaEntryStatusCommandHandler;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntrySeriesCommand;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntrySeriesCommandHandler;
use Agenda\Agenda\Agenda\Application\Command\UpdateAgendaEntrySeriesCommand;
use Agenda\Agenda\Agenda\Application\Command\UpdateAgendaEntrySeriesCommandHandler;
use Agenda\Agenda\Agenda\Domain\Exception\AgendaEntrySeriesException;
use Agenda\Agenda\Agenda\Domain\Exception\UpdateAgendaEntrySeriesException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Infrastructure\Domain\Model\InMemory\InMemoryAgendaEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateAgendaEntrySeriesCommandHandlerTest extends TestCase
{
    private const string SERIES_ID = 'agenda-entry-1';

    private InMemoryAgendaEntryRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private ChangeAgendaEntryStatusCommandHandler $changeStatusHandler;
    private UpdateAgendaEntrySeriesCommandHandler $handler;

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
            category: 'health',
            notes: 'Con el desayuno.',
            createdByUserId: 'god-user-id',
        ));

        $this->domainEventCollectorService->pullEvents();

        $this->changeStatusHandler = new ChangeAgendaEntryStatusCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->handler = new UpdateAgendaEntrySeriesCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItPropagatesTheSharedFieldsToEveryDay(): void
    {
        ($this->handler)($this->command(entryDate: '2026-07-27', endDate: '2026-07-29', title: '  Pastilla de la mañana  '));

        $entries = $this->repository->findBySeriesId(seriesId: self::SERIES_ID);

        $this->assertCount(expectedCount: 3, haystack: $entries);

        foreach ($entries as $entry) {
            $this->assertSame(expected: 'Pastilla de la mañana', actual: $entry->title);
            $this->assertSame(expected: 'exercise', actual: $entry->category);
            $this->assertSame(expected: 'Nota nueva.', actual: $entry->notes);
            $this->assertNull(actual: $entry->time);
        }
    }

    public function testItCreatesTheMissingDaysWhenTheRangeGrows(): void
    {
        ($this->handler)($this->command(entryDate: '2026-07-27', endDate: '2026-07-31'));

        $this->assertSame(
            expected: ['2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31'],
            actual: $this->seriesDates(),
        );
    }

    public function testItDeletesTheSurplusDaysWhenTheRangeShrinks(): void
    {
        ($this->handler)($this->command(entryDate: '2026-07-28', endDate: '2026-07-29'));

        $this->assertSame(expected: ['2026-07-28', '2026-07-29'], actual: $this->seriesDates());
    }

    public function testItShiftsTheRangeReplacingTheDaysThatFallOutside(): void
    {
        ($this->handler)($this->command(entryDate: '2026-07-29', endDate: '2026-07-31'));

        $this->assertSame(
            expected: ['2026-07-29', '2026-07-30', '2026-07-31'],
            actual: $this->seriesDates(),
        );
    }

    public function testItKeepsTheDoneFlagOfTheDaysThatSurvive(): void
    {
        $entries = $this->repository->findBySeriesId(seriesId: self::SERIES_ID);
        ($this->changeStatusHandler)(new ChangeAgendaEntryStatusCommand(
            agendaEntryId: $entries[1]->id,
            done: true,
            updatedByUserId: 'god-user-id',
        ));

        ($this->handler)($this->command(entryDate: '2026-07-27', endDate: '2026-07-31'));

        $byDate = [];
        foreach ($this->repository->findBySeriesId(seriesId: self::SERIES_ID) as $entry) {
            $byDate[$entry->entryDate] = $entry;
        }

        $this->assertTrue(condition: $byDate['2026-07-28']->done);
        $this->assertFalse(condition: $byDate['2026-07-27']->done);
        $this->assertFalse(condition: $byDate['2026-07-30']->done);
    }

    public function testEveryEntryKeepsTheSameSeriesIdIncludingTheNewOnes(): void
    {
        ($this->handler)($this->command(entryDate: '2026-07-27', endDate: '2026-07-31'));

        foreach ($this->repository->findBySeriesId(seriesId: self::SERIES_ID) as $entry) {
            $this->assertSame(expected: self::SERIES_ID, actual: $entry->seriesId);
        }
    }

    public function testItThrowsWhenTheRangeCollapsesToASingleDay(): void
    {
        $this->expectException(exception: AgendaEntrySeriesException::class);

        ($this->handler)($this->command(entryDate: '2026-07-28', endDate: '2026-07-28'));
    }

    public function testItThrowsWhenTheSeriesDoesNotExist(): void
    {
        $this->expectException(exception: UpdateAgendaEntrySeriesException::class);

        ($this->handler)(new UpdateAgendaEntrySeriesCommand(
            seriesId: 'unknown-series',
            entryDate: '2026-07-27',
            endDate: '2026-07-29',
            title: 'Tomar la pastilla',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnEmptySeriesId(): void
    {
        $this->expectException(exception: UpdateAgendaEntrySeriesException::class);

        ($this->handler)(new UpdateAgendaEntrySeriesCommand(
            seriesId: '',
            entryDate: '2026-07-27',
            endDate: '2026-07-29',
            title: 'Tomar la pastilla',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheEndDateIsBeforeTheStartDate(): void
    {
        $this->expectException(exception: AgendaEntrySeriesException::class);

        ($this->handler)($this->command(entryDate: '2026-07-29', endDate: '2026-07-27'));
    }

    private function command(
        string $entryDate,
        string $endDate,
        string $title = 'Tomar la pastilla',
    ): UpdateAgendaEntrySeriesCommand {
        return new UpdateAgendaEntrySeriesCommand(
            seriesId: self::SERIES_ID,
            entryDate: $entryDate,
            endDate: $endDate,
            title: $title,
            kind: AgendaEntry::KIND_TASK,
            category: 'exercise',
            notes: 'Nota nueva.',
            updatedByUserId: 'god-user-id',
        );
    }

    /**
     * @return array<int, string>
     */
    private function seriesDates(): array
    {
        $dates = array_map(
            static fn (AgendaEntry $entry) => $entry->entryDate,
            $this->repository->findBySeriesId(seriesId: self::SERIES_ID),
        );
        sort(array: $dates);

        return $dates;
    }
}
