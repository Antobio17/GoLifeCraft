<?php

namespace App\Tests\Economy\Finance\Account\Application\Command;

use Economy\Finance\Account\Application\Command\CreateFinanceAccountCommand;
use Economy\Finance\Account\Application\Command\CreateFinanceAccountCommandHandler;
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

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceAccountRepository();
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

    /**
     * @param array<int, string> $existingNames
     */
    private function buildHandler(array $existingNames = []): CreateFinanceAccountCommandHandler
    {
        return new CreateFinanceAccountCommandHandler(
            financeAccountRepository: $this->repository,
            needleDataQuery: new InMemoryCreateFinanceAccountNeedleDataQuery(names: $existingNames),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
