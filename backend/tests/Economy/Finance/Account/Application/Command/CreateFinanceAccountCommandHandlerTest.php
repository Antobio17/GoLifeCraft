<?php

namespace App\Tests\Economy\Finance\Account\Application\Command;

use Economy\Finance\Account\Application\Command\CreateFinanceAccountCommand;
use Economy\Finance\Account\Application\Command\CreateFinanceAccountCommandHandler;
use Economy\Finance\Account\Domain\Event\FinanceAccountCreated;
use Economy\Finance\Account\Domain\Exception\CreateFinanceAccountException;
use Economy\Finance\Account\Domain\Model\FinanceAccount;
use Economy\Finance\Account\Infrastructure\Domain\Model\InMemory\InMemoryFinanceAccountRepository;
use Economy\Finance\Account\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateFinanceAccountNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateFinanceAccountCommandHandlerTest extends TestCase
{
    private InMemoryFinanceAccountRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceAccountRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
    }

    public function testItCreatesAnAccount(): void
    {
        ($this->buildHandler())(new CreateFinanceAccountCommand(
            name: '  Cuenta nómina  ',
            type: FinanceAccount::TYPE_BANK,
            createdByUserId: 'god-user-id',
        ));

        $account = $this->repository->findById(id: 'finance-account-1');

        $this->assertNotNull(actual: $account);
        $this->assertSame(expected: 'Cuenta nómina', actual: $account->name);
        $this->assertSame(expected: FinanceAccount::TYPE_BANK, actual: $account->type);
    }

    public function testItThrowsWhenNameIsEmpty(): void
    {
        $this->expectException(exception: CreateFinanceAccountException::class);

        ($this->buildHandler())(new CreateFinanceAccountCommand(
            name: '   ',
            type: FinanceAccount::TYPE_CASH,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTypeIsNotSupported(): void
    {
        $this->expectException(exception: CreateFinanceAccountException::class);

        ($this->buildHandler())(new CreateFinanceAccountCommand(
            name: 'Crypto',
            type: 'wallet',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenNameIsAlreadyTaken(): void
    {
        $this->expectException(exception: CreateFinanceAccountException::class);

        ($this->buildHandler(existingNames: ['Efectivo']))(new CreateFinanceAccountCommand(
            name: 'Efectivo',
            type: FinanceAccount::TYPE_CASH,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItCarriesTheInitialBalanceInTheCreationEvent(): void
    {
        ($this->buildHandler())(new CreateFinanceAccountCommand(
            name: 'Cajamar',
            type: FinanceAccount::TYPE_BANK,
            createdByUserId: 'god-user-id',
            initialBalance: 1500.0,
            initialBalanceDate: '2026-08-17',
        ));

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: FinanceAccountCreated::class, actual: $events[0]);
        $this->assertSame(expected: 1500.0, actual: $events[0]->initialBalance);
        $this->assertSame(expected: '2026-08-17', actual: $events[0]->initialBalanceDate);
    }

    public function testItLeavesTheCreationEventWithoutBalanceWhenNoneIsDeclared(): void
    {
        ($this->buildHandler())(new CreateFinanceAccountCommand(
            name: 'Cajamar',
            type: FinanceAccount::TYPE_BANK,
            createdByUserId: 'god-user-id',
        ));

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertInstanceOf(expected: FinanceAccountCreated::class, actual: $events[0]);
        $this->assertNull(actual: $events[0]->initialBalance);
    }

    public function testItThrowsWhenTheInitialBalanceDateIsInvalid(): void
    {
        $this->expectException(exception: CreateFinanceAccountException::class);

        ($this->buildHandler())(new CreateFinanceAccountCommand(
            name: 'Cajamar',
            type: FinanceAccount::TYPE_BANK,
            createdByUserId: 'god-user-id',
            initialBalance: 1500.0,
            initialBalanceDate: '17-08-2026',
        ));
    }

    /**
     * @param array<int, string> $existingNames
     */
    private function buildHandler(array $existingNames = []): CreateFinanceAccountCommandHandler
    {
        return new CreateFinanceAccountCommandHandler(
            financeAccountRepository: $this->repository,
            needleDataQuery: new InMemoryCreateFinanceAccountNeedleDataQuery(names: $existingNames),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
