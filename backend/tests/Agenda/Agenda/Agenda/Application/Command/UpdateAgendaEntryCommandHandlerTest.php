<?php

namespace App\Tests\Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntryCommand;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntryCommandHandler;
use Agenda\Agenda\Agenda\Application\Command\UpdateAgendaEntryCommand;
use Agenda\Agenda\Agenda\Application\Command\UpdateAgendaEntryCommandHandler;
use Agenda\Agenda\Agenda\Domain\Exception\UpdateAgendaEntryException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Infrastructure\Domain\Model\InMemory\InMemoryAgendaEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateAgendaEntryCommandHandlerTest extends TestCase
{
    private InMemoryAgendaEntryRepository $repository;
    private UpdateAgendaEntryCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $domainEventCollectorService = new DomainEventCollectorService();
        $this->repository = new InMemoryAgendaEntryRepository();

        $createHandler = new CreateAgendaEntryCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        ($createHandler)(new CreateAgendaEntryCommand(
            entryDate: '2026-07-27',
            time: '09:30',
            title: 'Revisión con el nutricionista',
            kind: AgendaEntry::KIND_APPOINTMENT,
            category: 'nutritionist',
            notes: '',
            createdByUserId: 'god-user-id',
        ));

        $this->handler = new UpdateAgendaEntryCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItUpdatesAgendaEntry(): void
    {
        ($this->handler)(new UpdateAgendaEntryCommand(
            agendaEntryId: 'agenda-entry-1',
            entryDate: '2026-07-28',
            time: '18:00',
            title: 'Revisión con el fisio',
            kind: AgendaEntry::KIND_APPOINTMENT,
            category: 'physio',
            notes: 'Molestia en el hombro derecho.',
            updatedByUserId: 'god-user-id',
        ));

        $entry = $this->repository->findById(id: 'agenda-entry-1');

        $this->assertSame(expected: '2026-07-28', actual: $entry->entryDate);
        $this->assertSame(expected: '18:00', actual: $entry->time);
        $this->assertSame(expected: 'Revisión con el fisio', actual: $entry->title);
        $this->assertSame(expected: 'physio', actual: $entry->category);
        $this->assertSame(expected: 'Molestia en el hombro derecho.', actual: $entry->notes);
    }

    public function testItClearsTheTimeWhenEmpty(): void
    {
        ($this->handler)(new UpdateAgendaEntryCommand(
            agendaEntryId: 'agenda-entry-1',
            entryDate: '2026-07-27',
            time: null,
            title: 'Revisión con el nutricionista',
            kind: AgendaEntry::KIND_APPOINTMENT,
            category: 'nutritionist',
            notes: '',
            updatedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->repository->findById(id: 'agenda-entry-1')->time);
    }

    public function testItThrowsWhenEntryDoesNotExist(): void
    {
        $this->expectException(exception: UpdateAgendaEntryException::class);

        ($this->handler)(new UpdateAgendaEntryCommand(
            agendaEntryId: 'ghost-entry',
            entryDate: '2026-07-27',
            time: null,
            title: 'Comprar fruta',
            kind: AgendaEntry::KIND_TASK,
            category: '',
            notes: '',
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenCategoryDoesNotBelongToKind(): void
    {
        $this->expectException(exception: UpdateAgendaEntryException::class);

        ($this->handler)(new UpdateAgendaEntryCommand(
            agendaEntryId: 'agenda-entry-1',
            entryDate: '2026-07-27',
            time: null,
            title: 'Comprar fruta',
            kind: AgendaEntry::KIND_TASK,
            category: 'nutritionist',
            notes: '',
            updatedByUserId: 'god-user-id',
        ));
    }
}
