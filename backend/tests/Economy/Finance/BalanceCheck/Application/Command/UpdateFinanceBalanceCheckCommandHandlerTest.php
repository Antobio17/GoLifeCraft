<?php

namespace App\Tests\Economy\Finance\BalanceCheck\Application\Command;

use Economy\Finance\BalanceCheck\Application\Command\UpdateFinanceBalanceCheckCommand;
use Economy\Finance\BalanceCheck\Application\Command\UpdateFinanceBalanceCheckCommandHandler;
use Economy\Finance\BalanceCheck\Domain\Exception\UpdateFinanceBalanceCheckException;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheck;
use Economy\Finance\BalanceCheck\Infrastructure\Domain\Model\InMemory\InMemoryFinanceBalanceCheckRepository;
use Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateFinanceBalanceCheckNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateFinanceBalanceCheckCommandHandlerTest extends TestCase
{
    private InMemoryFinanceBalanceCheckRepository $repository;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceBalanceCheckRepository();
        $this->repository->save(financeBalanceCheck: FinanceBalanceCheck::create(
            id: 'check-1',
            accountId: 'account-1',
            checkDate: '2026-08-17',
            amount: 1000.0,
            note: '',
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        ));
    }

    public function testItUpdatesTheCheckedAmount(): void
    {
        ($this->buildHandler())(new UpdateFinanceBalanceCheckCommand(
            financeBalanceCheckId: 'check-1',
            checkDate: '2026-08-18',
            amount: 987.654,
            note: 'Corregido',
            updatedByUserId: 'god-user-id',
        ));

        $check = $this->repository->findById(id: 'check-1');

        $this->assertNotNull(actual: $check);
        $this->assertSame(expected: '2026-08-18', actual: $check->checkDate);
        $this->assertSame(expected: 987.65, actual: $check->amount);
        $this->assertSame(expected: 'Corregido', actual: $check->note);
    }

    public function testItThrowsWhenAnotherCheckOwnsThatDate(): void
    {
        $this->expectException(exception: UpdateFinanceBalanceCheckException::class);

        ($this->buildHandler(takenDates: ['check-2' => 'account-1|2026-08-18']))(new UpdateFinanceBalanceCheckCommand(
            financeBalanceCheckId: 'check-1',
            checkDate: '2026-08-18',
            amount: 100.0,
            note: '',
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheCheckDoesNotExist(): void
    {
        $this->expectException(exception: UpdateFinanceBalanceCheckException::class);

        ($this->buildHandler())(new UpdateFinanceBalanceCheckCommand(
            financeBalanceCheckId: 'unknown-check',
            checkDate: '2026-08-18',
            amount: 100.0,
            note: '',
            updatedByUserId: 'god-user-id',
        ));
    }

    /**
     * @param array<string, string> $takenDates
     */
    private function buildHandler(array $takenDates = []): UpdateFinanceBalanceCheckCommandHandler
    {
        return new UpdateFinanceBalanceCheckCommandHandler(
            financeBalanceCheckRepository: $this->repository,
            needleDataQuery: new InMemoryUpdateFinanceBalanceCheckNeedleDataQuery(takenDatesByCheckId: $takenDates),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
