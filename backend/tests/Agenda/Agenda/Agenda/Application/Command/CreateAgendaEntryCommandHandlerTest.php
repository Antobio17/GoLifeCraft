<?php

namespace App\Tests\Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntryCommand;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntryCommandHandler;
use Agenda\Agenda\Agenda\Domain\Exception\CreateAgendaEntryException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Infrastructure\Domain\Model\InMemory\InMemoryAgendaEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateAgendaEntryCommandHandlerTest extends TestCase
{
    private InMemoryAgendaEntryRepository $repository;
    private CreateAgendaEntryCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryAgendaEntryRepository();
        $this->handler = new CreateAgendaEntryCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesAnAppointment(): void
    {
        ($this->handler)(new CreateAgendaEntryCommand(
            entryDate: '2026-07-27',
            time: '09:30',
            title: '  Revisión con el nutricionista  ',
            kind: AgendaEntry::KIND_APPOINTMENT,
            category: 'nutritionist',
            notes: 'Llevar el diario de la última semana.',
            createdByUserId: 'god-user-id',
        ));

        $entry = $this->repository->findById(id: 'agenda-entry-1');

        $this->assertNotNull(actual: $entry);
        $this->assertSame(expected: '2026-07-27', actual: $entry->entryDate);
        $this->assertSame(expected: '09:30', actual: $entry->time);
        $this->assertSame(expected: 'Revisión con el nutricionista', actual: $entry->title);
        $this->assertSame(expected: AgendaEntry::KIND_APPOINTMENT, actual: $entry->kind);
        $this->assertSame(expected: 'nutritionist', actual: $entry->category);
        $this->assertFalse(condition: $entry->done);
    }

    public function testItCreatesATaskWithoutTimeNorCategory(): void
    {
        ($this->handler)(new CreateAgendaEntryCommand(
            entryDate: '2026-07-27',
            time: '',
            title: 'Preparar las comidas de la semana',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));

        $entry = $this->repository->findById(id: 'agenda-entry-1');

        $this->assertNotNull(actual: $entry);
        $this->assertNull(actual: $entry->time);
        $this->assertSame(expected: '', actual: $entry->category);
        $this->assertSame(expected: '', actual: $entry->notes);
    }

    public function testItThrowsWhenTitleIsEmpty(): void
    {
        $this->expectException(exception: CreateAgendaEntryException::class);

        ($this->handler)(new CreateAgendaEntryCommand(
            entryDate: '2026-07-27',
            time: null,
            title: '   ',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenDateIsInvalid(): void
    {
        $this->expectException(exception: CreateAgendaEntryException::class);

        ($this->handler)(new CreateAgendaEntryCommand(
            entryDate: '27-07-2026',
            time: null,
            title: 'Comprar fruta',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTimeIsInvalid(): void
    {
        $this->expectException(exception: CreateAgendaEntryException::class);

        ($this->handler)(new CreateAgendaEntryCommand(
            entryDate: '2026-07-27',
            time: '9:30h',
            title: 'Comprar fruta',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenKindIsNotSupported(): void
    {
        $this->expectException(exception: CreateAgendaEntryException::class);

        ($this->handler)(new CreateAgendaEntryCommand(
            entryDate: '2026-07-27',
            time: null,
            title: 'Comprar fruta',
            kind: 'reminder',
            category: '',
            notes: '',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenCategoryDoesNotBelongToKind(): void
    {
        $this->expectException(exception: CreateAgendaEntryException::class);

        ($this->handler)(new CreateAgendaEntryCommand(
            entryDate: '2026-07-27',
            time: null,
            title: 'Comprar fruta',
            kind: AgendaEntry::KIND_TASK,
            category: 'dentist',
            notes: '',
            createdByUserId: 'god-user-id',
        ));
    }
}
