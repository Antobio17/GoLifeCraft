<?php

namespace App\Tests\Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Application\Command\ChangeAgendaEntryStatusCommand;
use Agenda\Agenda\Agenda\Application\Command\ChangeAgendaEntryStatusCommandHandler;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntryCommand;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntryCommandHandler;
use Agenda\Agenda\Agenda\Domain\Exception\UpdateAgendaEntryException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Infrastructure\Domain\Model\InMemory\InMemoryAgendaEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ChangeAgendaEntryStatusCommandHandlerTest extends TestCase
{
    private InMemoryAgendaEntryRepository $repository;
    private ChangeAgendaEntryStatusCommandHandler $handler;

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
            time: null,
            title: 'Preparar las comidas de la semana',
            kind: AgendaEntry::KIND_TASK,
            category: 'cooking',
            notes: '',
            createdByUserId: 'god-user-id',
        ));

        $this->handler = new ChangeAgendaEntryStatusCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItMarksTheEntryAsDone(): void
    {
        ($this->handler)(new ChangeAgendaEntryStatusCommand(
            agendaEntryId: 'agenda-entry-1',
            done: true,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertTrue(condition: $this->repository->findById(id: 'agenda-entry-1')->done);
    }

    public function testItMarksTheEntryAsPendingAgain(): void
    {
        ($this->handler)(new ChangeAgendaEntryStatusCommand(
            agendaEntryId: 'agenda-entry-1',
            done: true,
            updatedByUserId: 'god-user-id',
        ));
        ($this->handler)(new ChangeAgendaEntryStatusCommand(
            agendaEntryId: 'agenda-entry-1',
            done: false,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertFalse(condition: $this->repository->findById(id: 'agenda-entry-1')->done);
    }

    public function testItThrowsWhenEntryDoesNotExist(): void
    {
        $this->expectException(exception: UpdateAgendaEntryException::class);

        ($this->handler)(new ChangeAgendaEntryStatusCommand(
            agendaEntryId: 'ghost-entry',
            done: true,
            updatedByUserId: 'god-user-id',
        ));
    }
}
