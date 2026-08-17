<?php

namespace App\Tests\Economy\Finance\BalanceCheck\Application\Command;

use Economy\Finance\BalanceCheck\Application\Command\CreateFinanceBalanceCheckCommand;
use Economy\Finance\BalanceCheck\Application\Command\CreateFinanceBalanceCheckCommandHandler;
use Economy\Finance\BalanceCheck\Domain\Exception\CreateFinanceBalanceCheckException;
use Economy\Finance\BalanceCheck\Infrastructure\Domain\Model\InMemory\InMemoryFinanceBalanceCheckRepository;
use Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateFinanceBalanceCheckNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateFinanceBalanceCheckCommandHandlerTest extends TestCase
{
    private InMemoryFinanceBalanceCheckRepository $repository;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceBalanceCheckRepository();
    }

    public function testItRegistersTheMoneyHeldByAnAccount(): void
    {
        ($this->buildHandler())(new CreateFinanceBalanceCheckCommand(
            accountId: 'account-1',
            checkDate: '2026-08-17',
            amount: 1234.567,
            note: '  Cuadre del banco  ',
            createdByUserId: 'god-user-id',
        ));

        $check = $this->repository->findById(id: 'finance-balance-check-1');

        $this->assertNotNull(actual: $check);
        $this->assertSame(expected: 'account-1', actual: $check->accountId);
        $this->assertSame(expected: '2026-08-17', actual: $check->checkDate);
        $this->assertSame(expected: 1234.57, actual: $check->amount);
        $this->assertSame(expected: 'Cuadre del banco', actual: $check->note);
    }

    public function testItAcceptsANegativeBalance(): void
    {
        ($this->buildHandler())(new CreateFinanceBalanceCheckCommand(
            accountId: 'account-1',
            checkDate: '2026-08-17',
            amount: -42.5,
            note: '',
            createdByUserId: 'god-user-id',
        ));

        $check = $this->repository->findById(id: 'finance-balance-check-1');

        $this->assertNotNull(actual: $check);
        $this->assertSame(expected: -42.5, actual: $check->amount);
    }

    public function testItThrowsWhenTheAccountDoesNotExist(): void
    {
        $this->expectException(exception: CreateFinanceBalanceCheckException::class);

        ($this->buildHandler(accountIds: []))(new CreateFinanceBalanceCheckCommand(
            accountId: 'unknown-account',
            checkDate: '2026-08-17',
            amount: 100.0,
            note: '',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheAccountAlreadyHasACheckOnThatDate(): void
    {
        $this->expectException(exception: CreateFinanceBalanceCheckException::class);

        ($this->buildHandler(takenDates: ['account-1|2026-08-17']))(new CreateFinanceBalanceCheckCommand(
            accountId: 'account-1',
            checkDate: '2026-08-17',
            amount: 100.0,
            note: '',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheDateIsInvalid(): void
    {
        $this->expectException(exception: CreateFinanceBalanceCheckException::class);

        ($this->buildHandler())(new CreateFinanceBalanceCheckCommand(
            accountId: 'account-1',
            checkDate: '17-08-2026',
            amount: 100.0,
            note: '',
            createdByUserId: 'god-user-id',
        ));
    }

    /**
     * @param array<int, string> $accountIds
     * @param array<int, string> $takenDates
     */
    private function buildHandler(
        array $accountIds = ['account-1'],
        array $takenDates = [],
    ): CreateFinanceBalanceCheckCommandHandler {
        return new CreateFinanceBalanceCheckCommandHandler(
            financeBalanceCheckRepository: $this->repository,
            needleDataQuery: new InMemoryCreateFinanceBalanceCheckNeedleDataQuery(
                accountIds: $accountIds,
                takenDatesByAccountId: $takenDates,
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
