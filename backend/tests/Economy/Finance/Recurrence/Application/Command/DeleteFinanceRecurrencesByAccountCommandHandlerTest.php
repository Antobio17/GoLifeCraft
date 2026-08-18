<?php

namespace App\Tests\Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Application\Command\DeleteFinanceRecurrencesByAccountCommand;
use Economy\Finance\Recurrence\Application\Command\DeleteFinanceRecurrencesByAccountCommandHandler;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrence;
use Economy\Finance\Recurrence\Infrastructure\Domain\Model\InMemory\InMemoryFinanceRecurrenceRepository;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteFinanceRecurrencesByAccountCommandHandlerTest extends TestCase
{
    private InMemoryFinanceRecurrenceRepository $repository;
    private DeleteFinanceRecurrencesByAccountCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceRecurrenceRepository();
        $this->handler = new DeleteFinanceRecurrencesByAccountCommandHandler(
            financeRecurrenceRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $this->givenRecurrence(accountId: 'account-1');
        $this->givenRecurrence(accountId: 'account-2');
    }

    public function testItDeletesOnlyTheRecurrencesOfTheAccount(): void
    {
        ($this->handler)(new DeleteFinanceRecurrencesByAccountCommand(
            accountId: 'account-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertCount(expectedCount: 0, haystack: $this->repository->findByAccountId(accountId: 'account-1'));
        $this->assertCount(expectedCount: 1, haystack: $this->repository->findByAccountId(accountId: 'account-2'));
    }

    private function givenRecurrence(string $accountId): void
    {
        $this->repository->save(financeRecurrence: FinanceRecurrence::create(
            id: $this->repository->nextId(),
            accountId: $accountId,
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
}
