<?php

namespace App\Tests\Economy\Finance\Account\Application\Command;

use Economy\Finance\Account\Application\Command\UpdateFinanceAccountCommand;
use Economy\Finance\Account\Application\Command\UpdateFinanceAccountCommandHandler;
use Economy\Finance\Account\Domain\Exception\UpdateFinanceAccountException;
use Economy\Finance\Account\Domain\Model\FinanceAccount;
use Economy\Finance\Account\Infrastructure\Domain\Model\InMemory\InMemoryFinanceAccountRepository;
use Economy\Finance\Account\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateFinanceAccountNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateFinanceAccountCommandHandlerTest extends TestCase
{
    private InMemoryFinanceAccountRepository $repository;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceAccountRepository();
        $this->repository->save(financeAccount: FinanceAccount::create(
            id: 'account-1',
            name: 'Cuenta nómina',
            type: FinanceAccount::TYPE_BANK,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        ));
    }

    public function testItUpdatesTheAccount(): void
    {
        ($this->buildHandler())(new UpdateFinanceAccountCommand(
            financeAccountId: 'account-1',
            name: 'Cuenta principal',
            type: FinanceAccount::TYPE_SAVINGS,
            updatedByUserId: 'god-user-id',
        ));

        $account = $this->repository->findById(id: 'account-1');

        $this->assertNotNull(actual: $account);
        $this->assertSame(expected: 'Cuenta principal', actual: $account->name);
        $this->assertSame(expected: FinanceAccount::TYPE_SAVINGS, actual: $account->type);
    }

    public function testItKeepsItsOwnNameWithoutClashing(): void
    {
        ($this->buildHandler(namesByAccountId: ['account-1' => 'Cuenta nómina']))(new UpdateFinanceAccountCommand(
            financeAccountId: 'account-1',
            name: 'Cuenta nómina',
            type: FinanceAccount::TYPE_CARD,
            updatedByUserId: 'god-user-id',
        ));

        $account = $this->repository->findById(id: 'account-1');

        $this->assertNotNull(actual: $account);
        $this->assertSame(expected: FinanceAccount::TYPE_CARD, actual: $account->type);
    }

    public function testItThrowsWhenAnotherAccountOwnsTheName(): void
    {
        $this->expectException(exception: UpdateFinanceAccountException::class);

        ($this->buildHandler(namesByAccountId: ['account-2' => 'Efectivo']))(new UpdateFinanceAccountCommand(
            financeAccountId: 'account-1',
            name: 'Efectivo',
            type: FinanceAccount::TYPE_CASH,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheAccountDoesNotExist(): void
    {
        $this->expectException(exception: UpdateFinanceAccountException::class);

        ($this->buildHandler())(new UpdateFinanceAccountCommand(
            financeAccountId: 'unknown-account',
            name: 'Cuenta',
            type: FinanceAccount::TYPE_BANK,
            updatedByUserId: 'god-user-id',
        ));
    }

    /**
     * @param array<string, string> $namesByAccountId
     */
    private function buildHandler(array $namesByAccountId = []): UpdateFinanceAccountCommandHandler
    {
        return new UpdateFinanceAccountCommandHandler(
            financeAccountRepository: $this->repository,
            needleDataQuery: new InMemoryUpdateFinanceAccountNeedleDataQuery(namesByAccountId: $namesByAccountId),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
