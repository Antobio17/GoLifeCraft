<?php

namespace App\Tests\Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Application\Command\CreateFinanceRecurrenceCommand;
use Economy\Finance\Recurrence\Application\Command\CreateFinanceRecurrenceCommandHandler;
use Economy\Finance\Recurrence\Domain\Exception\CreateFinanceRecurrenceException;
use Economy\Finance\Recurrence\Infrastructure\Domain\Model\InMemory\InMemoryFinanceRecurrenceRepository;
use Economy\Finance\Recurrence\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateFinanceRecurrenceNeedleDataQuery;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateFinanceRecurrenceCommandHandlerTest extends TestCase
{
    private InMemoryFinanceRecurrenceRepository $repository;
    private CreateFinanceRecurrenceCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceRecurrenceRepository();
        $this->handler = new CreateFinanceRecurrenceCommandHandler(
            financeRecurrenceRepository: $this->repository,
            needleDataQuery: new InMemoryCreateFinanceRecurrenceNeedleDataQuery(accountIds: ['account-1']),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesARecurringIncome(): void
    {
        ($this->handler)($this->command(kind: FinanceTransaction::KIND_INCOME, category: 'groceries'));

        $recurrence = $this->repository->findById(id: 'finance-recurrence-1');

        $this->assertNotNull(actual: $recurrence);
        $this->assertSame(expected: 'account-1', actual: $recurrence->accountId);
        $this->assertSame(expected: FinanceTransaction::KIND_INCOME, actual: $recurrence->kind);
        $this->assertSame(expected: 1850.0, actual: $recurrence->amount);
        $this->assertSame(expected: FinanceTransaction::CATEGORY_OTHER, actual: $recurrence->category);
        $this->assertSame(expected: 'Nómina', actual: $recurrence->note);
        $this->assertSame(expected: 25, actual: $recurrence->dayOfMonth);
        $this->assertSame(expected: '2026-08', actual: $recurrence->startMonth);
        $this->assertNull(actual: $recurrence->endMonth);
        $this->assertTrue(condition: $recurrence->active);
        $this->assertNull(actual: $recurrence->lastRunMonth);
    }

    public function testItKeepsTheCategoryOfARecurringExpense(): void
    {
        ($this->handler)($this->command(kind: FinanceTransaction::KIND_EXPENSE, category: 'subscriptions'));

        $recurrence = $this->repository->findById(id: 'finance-recurrence-1');

        $this->assertNotNull(actual: $recurrence);
        $this->assertSame(expected: 'subscriptions', actual: $recurrence->category);
    }

    public function testItThrowsWhenTheAccountDoesNotExist(): void
    {
        $this->expectException(exception: CreateFinanceRecurrenceException::class);

        ($this->handler)($this->command(accountId: 'unknown-account'));
    }

    public function testItThrowsWhenTheChargeDayIsOutOfRange(): void
    {
        $this->expectException(exception: CreateFinanceRecurrenceException::class);

        ($this->handler)($this->command(dayOfMonth: 32));
    }

    public function testItThrowsWhenTheStartMonthIsNotAMonth(): void
    {
        $this->expectException(exception: CreateFinanceRecurrenceException::class);

        ($this->handler)($this->command(startMonth: '2026-08-25'));
    }

    public function testItThrowsWhenTheEndMonthIsEarlierThanTheStartMonth(): void
    {
        $this->expectException(exception: CreateFinanceRecurrenceException::class);

        ($this->handler)($this->command(endMonth: '2026-07'));
    }

    private function command(
        string $accountId = 'account-1',
        string $kind = FinanceTransaction::KIND_INCOME,
        string $category = 'other',
        int $dayOfMonth = 25,
        string $startMonth = '2026-08',
        ?string $endMonth = null,
    ): CreateFinanceRecurrenceCommand {
        return new CreateFinanceRecurrenceCommand(
            accountId: $accountId,
            kind: $kind,
            amount: 1850.0,
            category: $category,
            note: '  Nómina  ',
            store: null,
            dayOfMonth: $dayOfMonth,
            startMonth: $startMonth,
            endMonth: $endMonth,
            active: true,
            createdByUserId: 'god-user-id',
        );
    }
}
