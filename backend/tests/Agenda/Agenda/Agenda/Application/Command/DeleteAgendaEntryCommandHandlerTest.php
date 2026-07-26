<?php

namespace App\Tests\Agenda\Agenda\Agenda\Application\Command;

use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntryCommand;
use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntryCommandHandler;
use Agenda\Agenda\Agenda\Application\Command\DeleteAgendaEntryCommand;
use Agenda\Agenda\Agenda\Application\Command\DeleteAgendaEntryCommandHandler;
use Agenda\Agenda\Agenda\Domain\Exception\DeleteAgendaEntryException;
use Agenda\Agenda\Agenda\Domain\Model\AgendaEntry;
use Agenda\Agenda\Agenda\Infrastructure\Domain\Model\InMemory\InMemoryAgendaEntryRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteAgendaEntryCommandHandlerTest extends TestCase
{
    private InMemoryAgendaEntryRepository $repository;
    private DeleteAgendaEntryCommandHandler $handler;

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
            time: '11:00',
            title: 'Compra en el mercado',
            kind: AgendaEntry::KIND_TASK,
            category: 'groceries',
            notes: '',
            createdByUserId: 'god-user-id',
        ));

        $this->handler = new DeleteAgendaEntryCommandHandler(
            agendaEntryRepository: $this->repository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItDeletesAgendaEntry(): void
    {
        ($this->handler)(new DeleteAgendaEntryCommand(
            agendaEntryId: 'agenda-entry-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->repository->findById(id: 'agenda-entry-1'));
    }

    public function testItThrowsWhenEntryDoesNotExist(): void
    {
        $this->expectException(exception: DeleteAgendaEntryException::class);

        ($this->handler)(new DeleteAgendaEntryCommand(
            agendaEntryId: 'ghost-entry',
            deletedByUserId: 'god-user-id',
        ));
    }
}
