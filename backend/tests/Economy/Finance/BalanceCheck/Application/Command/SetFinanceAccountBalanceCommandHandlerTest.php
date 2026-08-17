<?php

namespace App\Tests\Economy\Finance\BalanceCheck\Application\Command;

use Economy\Finance\BalanceCheck\Application\Command\SetFinanceAccountBalanceCommand;
use Economy\Finance\BalanceCheck\Application\Command\SetFinanceAccountBalanceCommandHandler;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheck;
use Economy\Finance\BalanceCheck\Infrastructure\Domain\Model\InMemory\InMemoryFinanceBalanceCheckRepository;
use Economy\Finance\BalanceCheck\Infrastructure\Domain\QueryModel\InMemory\InMemorySetFinanceAccountBalanceNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class SetFinanceAccountBalanceCommandHandlerTest extends TestCase
{
    private InMemoryFinanceBalanceCheckRepository $repository;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceBalanceCheckRepository();
    }

    public function testItStoresTheCountedMoneyWhenTheDayHasNoMovements(): void
    {
        ($this->buildHandler())(new SetFinanceAccountBalanceCommand(
            accountId: 'account-1',
            checkDate: '2026-08-17',
            balance: 1500.0,
            note: '',
            setByUserId: 'god-user-id',
        ));

        $check = $this->repository->findByAccountIdAndCheckDate(
            accountId: 'account-1',
            checkDate: '2026-08-17',
        );

        $this->assertNotNull(actual: $check);
        $this->assertSame(expected: 1500.0, actual: $check->amount);
    }

    public function testItTakesTheMovementsOfTheDayOutOfTheCountedMoney(): void
    {
        ($this->buildHandler(netMovements: ['account-1|2026-08-17' => -20.0]))(new SetFinanceAccountBalanceCommand(
            accountId: 'account-1',
            checkDate: '2026-08-17',
            balance: 500.0,
            note: '',
            setByUserId: 'god-user-id',
        ));

        $check = $this->repository->findByAccountIdAndCheckDate(
            accountId: 'account-1',
            checkDate: '2026-08-17',
        );

        $this->assertNotNull(actual: $check);
        $this->assertSame(expected: 520.0, actual: $check->amount);
    }

    public function testItOverwritesTheCheckTheAccountAlreadyHasOnThatDate(): void
    {
        $this->repository->save(financeBalanceCheck: $this->buildExistingCheck());

        ($this->buildHandler())(new SetFinanceAccountBalanceCommand(
            accountId: 'account-1',
            checkDate: '2026-08-17',
            balance: 900.0,
            note: '',
            setByUserId: 'god-user-id',
        ));

        $checks = $this->repository->findByAccountId(accountId: 'account-1');

        $this->assertCount(expectedCount: 1, haystack: $checks);
        $this->assertSame(expected: 900.0, actual: $checks[0]->amount);
    }

    public function testItKeepsTheNoteOfTheCheckItOverwrites(): void
    {
        $this->repository->save(financeBalanceCheck: $this->buildExistingCheck());

        ($this->buildHandler())(new SetFinanceAccountBalanceCommand(
            accountId: 'account-1',
            checkDate: '2026-08-17',
            balance: 900.0,
            note: '',
            setByUserId: 'god-user-id',
        ));

        $checks = $this->repository->findByAccountId(accountId: 'account-1');

        $this->assertSame(expected: 'Cuadre de la nómina', actual: $checks[0]->note);
    }

    public function testItLeavesTheChecksOfOtherDaysAlone(): void
    {
        $this->repository->save(financeBalanceCheck: $this->buildExistingCheck());

        ($this->buildHandler())(new SetFinanceAccountBalanceCommand(
            accountId: 'account-1',
            checkDate: '2026-08-18',
            balance: 900.0,
            note: '',
            setByUserId: 'god-user-id',
        ));

        $this->assertCount(
            expectedCount: 2,
            haystack: $this->repository->findByAccountId(accountId: 'account-1'),
        );
    }

    private function buildExistingCheck(): FinanceBalanceCheck
    {
        return FinanceBalanceCheck::create(
            id: 'finance-balance-check-0',
            accountId: 'account-1',
            checkDate: '2026-08-17',
            amount: 100.0,
            note: 'Cuadre de la nómina',
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    /**
     * @param array<string, float> $netMovements
     */
    private function buildHandler(array $netMovements = []): SetFinanceAccountBalanceCommandHandler
    {
        return new SetFinanceAccountBalanceCommandHandler(
            financeBalanceCheckRepository: $this->repository,
            needleDataQuery: new InMemorySetFinanceAccountBalanceNeedleDataQuery(
                netMovementsByAccountDate: $netMovements,
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
