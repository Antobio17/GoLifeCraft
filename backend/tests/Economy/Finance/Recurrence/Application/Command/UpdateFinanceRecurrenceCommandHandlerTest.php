<?php

namespace App\Tests\Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Application\Command\UpdateFinanceRecurrenceCommand;
use Economy\Finance\Recurrence\Application\Command\UpdateFinanceRecurrenceCommandHandler;
use Economy\Finance\Recurrence\Domain\Exception\UpdateFinanceRecurrenceException;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrence;
use Economy\Finance\Recurrence\Infrastructure\Domain\Model\InMemory\InMemoryFinanceRecurrenceRepository;
use Economy\Finance\Recurrence\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateFinanceRecurrenceNeedleDataQuery;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateFinanceRecurrenceCommandHandlerTest extends TestCase
{
    private InMemoryFinanceRecurrenceRepository $repository;
    private UpdateFinanceRecurrenceCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceRecurrenceRepository();
        $this->handler = new UpdateFinanceRecurrenceCommandHandler(
            financeRecurrenceRepository: $this->repository,
            needleDataQuery: new InMemoryUpdateFinanceRecurrenceNeedleDataQuery(accountIds: ['account-1']),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $this->repository->save(financeRecurrence: FinanceRecurrence::create(
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
            active: true,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        ));
    }

    public function testItRaisesTheAmountAndMovesTheChargeDay(): void
    {
        ($this->handler)($this->command(amount: 1920.5, dayOfMonth: 1));

        $recurrence = $this->repository->findById(id: 'finance-recurrence-1');

        $this->assertNotNull(actual: $recurrence);
        $this->assertSame(expected: 1920.5, actual: $recurrence->amount);
        $this->assertSame(expected: 1, actual: $recurrence->dayOfMonth);
    }

    public function testItPausesTheRecurrenceWithoutLosingWhatWasAlreadyBooked(): void
    {
        ($this->handler)($this->command(active: false));

        $recurrence = $this->repository->findById(id: 'finance-recurrence-1');

        $this->assertNotNull(actual: $recurrence);
        $this->assertFalse(condition: $recurrence->active);
        $this->assertNull(actual: $recurrence->lastRunMonth);
    }

    public function testItSkipsTheMonthsSleptThroughWhenTheRecurrenceIsResumed(): void
    {
        ($this->handler)($this->command(active: false));
        ($this->handler)($this->command(active: true));

        $recurrence = $this->repository->findById(id: 'finance-recurrence-1');
        $previousMonth = (new \DateTimeImmutable(datetime: 'first day of last month'))->format(format: 'Y-m');

        $this->assertNotNull(actual: $recurrence);
        $this->assertTrue(condition: $recurrence->active);
        $this->assertSame(expected: $previousMonth, actual: $recurrence->lastRunMonth);
    }

    public function testItThrowsWhenTheRecurrenceDoesNotExist(): void
    {
        $this->expectException(exception: UpdateFinanceRecurrenceException::class);

        ($this->handler)($this->command(financeRecurrenceId: 'unknown-recurrence'));
    }

    public function testItThrowsWhenTheAccountDoesNotExist(): void
    {
        $this->expectException(exception: UpdateFinanceRecurrenceException::class);

        ($this->handler)($this->command(accountId: 'unknown-account'));
    }

    private function command(
        string $financeRecurrenceId = 'finance-recurrence-1',
        string $accountId = 'account-1',
        float $amount = 1850.0,
        int $dayOfMonth = 25,
        bool $active = true,
    ): UpdateFinanceRecurrenceCommand {
        return new UpdateFinanceRecurrenceCommand(
            financeRecurrenceId: $financeRecurrenceId,
            accountId: $accountId,
            kind: FinanceTransaction::KIND_INCOME,
            amount: $amount,
            category: FinanceTransaction::CATEGORY_OTHER,
            note: 'Nómina',
            store: null,
            dayOfMonth: $dayOfMonth,
            startMonth: '2026-08',
            endMonth: null,
            active: $active,
            updatedByUserId: 'god-user-id',
        );
    }
}
