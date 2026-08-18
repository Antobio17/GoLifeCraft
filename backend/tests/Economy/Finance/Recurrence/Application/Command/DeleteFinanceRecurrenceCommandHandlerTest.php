<?php

namespace App\Tests\Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Application\Command\DeleteFinanceRecurrenceCommand;
use Economy\Finance\Recurrence\Application\Command\DeleteFinanceRecurrenceCommandHandler;
use Economy\Finance\Recurrence\Domain\Exception\DeleteFinanceRecurrenceException;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrence;
use Economy\Finance\Recurrence\Infrastructure\Domain\Model\InMemory\InMemoryFinanceRecurrenceRepository;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteFinanceRecurrenceCommandHandlerTest extends TestCase
{
    private InMemoryFinanceRecurrenceRepository $repository;
    private DeleteFinanceRecurrenceCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceRecurrenceRepository();
        $this->handler = new DeleteFinanceRecurrenceCommandHandler(
            financeRecurrenceRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $this->repository->save(financeRecurrence: FinanceRecurrence::create(
            id: $this->repository->nextId(),
            accountId: 'account-1',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 12.99,
            category: 'subscriptions',
            note: 'Netflix',
            store: null,
            dayOfMonth: 1,
            startMonth: '2026-08',
            endMonth: null,
            active: true,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        ));
    }

    public function testItDeletesTheRecurrence(): void
    {
        ($this->handler)(new DeleteFinanceRecurrenceCommand(
            financeRecurrenceId: 'finance-recurrence-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->repository->findById(id: 'finance-recurrence-1'));
    }

    public function testItThrowsWhenTheRecurrenceDoesNotExist(): void
    {
        $this->expectException(exception: DeleteFinanceRecurrenceException::class);

        ($this->handler)(new DeleteFinanceRecurrenceCommand(
            financeRecurrenceId: 'unknown-recurrence',
            deletedByUserId: 'god-user-id',
        ));
    }
}
