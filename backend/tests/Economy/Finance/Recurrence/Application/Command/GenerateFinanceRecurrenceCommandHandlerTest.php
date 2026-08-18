<?php

namespace App\Tests\Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Application\Command\GenerateFinanceRecurrenceCommand;
use Economy\Finance\Recurrence\Application\Command\GenerateFinanceRecurrenceCommandHandler;
use Economy\Finance\Recurrence\Domain\Event\FinanceRecurrenceGenerated;
use Economy\Finance\Recurrence\Domain\Exception\GenerateFinanceRecurrenceException;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrence;
use Economy\Finance\Recurrence\Infrastructure\Domain\Model\InMemory\InMemoryFinanceRecurrenceRepository;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class GenerateFinanceRecurrenceCommandHandlerTest extends TestCase
{
    private InMemoryFinanceRecurrenceRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private GenerateFinanceRecurrenceCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceRecurrenceRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new GenerateFinanceRecurrenceCommandHandler(
            financeRecurrenceRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItBooksTheMonthAndAnnouncesTheMovement(): void
    {
        $this->givenRecurrence();

        ($this->handler)(new GenerateFinanceRecurrenceCommand(
            financeRecurrenceId: 'finance-recurrence-1',
            month: '2026-08',
            today: '2026-08-25',
        ));

        $recurrence = $this->repository->findById(id: 'finance-recurrence-1');

        $this->assertNotNull(actual: $recurrence);
        $this->assertSame(expected: '2026-08', actual: $recurrence->lastRunMonth);

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: FinanceRecurrenceGenerated::class, actual: $events[0]);
        $this->assertSame(expected: '2026-08-25', actual: $events[0]->transactionDate);
        $this->assertSame(expected: FinanceTransaction::KIND_INCOME, actual: $events[0]->kind);
        $this->assertSame(expected: 1850.0, actual: $events[0]->amount);
        $this->assertSame(expected: 'god-user-id', actual: $events[0]->createdByUserId);
    }

    public function testItBooksTheSameMonthOnlyOnce(): void
    {
        $this->givenRecurrence();

        ($this->handler)(new GenerateFinanceRecurrenceCommand(
            financeRecurrenceId: 'finance-recurrence-1',
            month: '2026-08',
            today: '2026-08-25',
        ));
        $this->domainEventCollectorService->pullEvents();

        ($this->handler)(new GenerateFinanceRecurrenceCommand(
            financeRecurrenceId: 'finance-recurrence-1',
            month: '2026-08',
            today: '2026-08-25',
        ));

        $this->assertCount(expectedCount: 0, haystack: $this->domainEventCollectorService->pullEvents());
    }

    public function testItWaitsUntilTheChargeDayArrives(): void
    {
        $this->givenRecurrence();

        ($this->handler)(new GenerateFinanceRecurrenceCommand(
            financeRecurrenceId: 'finance-recurrence-1',
            month: '2026-08',
            today: '2026-08-24',
        ));

        $recurrence = $this->repository->findById(id: 'finance-recurrence-1');

        $this->assertNotNull(actual: $recurrence);
        $this->assertNull(actual: $recurrence->lastRunMonth);
        $this->assertCount(expectedCount: 0, haystack: $this->domainEventCollectorService->pullEvents());
    }

    public function testItBooksNothingWhileTheRecurrenceIsPaused(): void
    {
        $this->givenRecurrence(active: false);

        ($this->handler)(new GenerateFinanceRecurrenceCommand(
            financeRecurrenceId: 'finance-recurrence-1',
            month: '2026-08',
            today: '2026-08-25',
        ));

        $recurrence = $this->repository->findById(id: 'finance-recurrence-1');

        $this->assertNotNull(actual: $recurrence);
        $this->assertNull(actual: $recurrence->lastRunMonth);
    }

    public function testItThrowsWhenTheRecurrenceDoesNotExist(): void
    {
        $this->expectException(exception: GenerateFinanceRecurrenceException::class);

        ($this->handler)(new GenerateFinanceRecurrenceCommand(
            financeRecurrenceId: 'unknown-recurrence',
            month: '2026-08',
            today: '2026-08-25',
        ));
    }

    private function givenRecurrence(bool $active = true): void
    {
        $recurrence = FinanceRecurrence::create(
            id: $this->repository->nextId(),
            accountId: 'account-1',
            kind: FinanceTransaction::KIND_INCOME,
            amount: 1850.0,
            category: FinanceTransaction::CATEGORY_OTHER,
            note: 'Nómina',
            store: null,
            dayOfMonth: 25,
            startMonth: '2026-08',
            endMonth: null,
            active: $active,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $recurrence->pullDomainEvents();

        $this->repository->save(financeRecurrence: $recurrence);
    }
}
