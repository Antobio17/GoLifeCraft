<?php

namespace App\Tests\Economy\Finance\Account\Application\Command;

use Economy\Finance\Account\Application\Command\DeleteFinanceAccountCommand;
use Economy\Finance\Account\Application\Command\DeleteFinanceAccountCommandHandler;
use Economy\Finance\Account\Domain\Exception\DeleteFinanceAccountException;
use Economy\Finance\Account\Domain\Model\FinanceAccount;
use Economy\Finance\Account\Infrastructure\Domain\Model\InMemory\InMemoryFinanceAccountRepository;
use Economy\Finance\Account\Infrastructure\Domain\QueryModel\InMemory\InMemoryDeleteFinanceAccountNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteFinanceAccountCommandHandlerTest extends TestCase
{
    private InMemoryFinanceAccountRepository $repository;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceAccountRepository();
        $this->repository->save(financeAccount: FinanceAccount::create(
            id: 'account-1',
            name: 'Efectivo',
            type: FinanceAccount::TYPE_CASH,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        ));
    }

    public function testItDeletesAnAccountWithoutMovements(): void
    {
        ($this->buildHandler())(new DeleteFinanceAccountCommand(
            financeAccountId: 'account-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->repository->findById(id: 'account-1'));
    }

    public function testItThrowsWhenTheAccountStillHasMovements(): void
    {
        $this->expectException(exception: DeleteFinanceAccountException::class);

        ($this->buildHandler(accountIdsWithTransactions: ['account-1']))(new DeleteFinanceAccountCommand(
            financeAccountId: 'account-1',
            deletedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheAccountDoesNotExist(): void
    {
        $this->expectException(exception: DeleteFinanceAccountException::class);

        ($this->buildHandler())(new DeleteFinanceAccountCommand(
            financeAccountId: 'unknown-account',
            deletedByUserId: 'god-user-id',
        ));
    }

    /**
     * @param array<int, string> $accountIdsWithTransactions
     */
    private function buildHandler(array $accountIdsWithTransactions = []): DeleteFinanceAccountCommandHandler
    {
        return new DeleteFinanceAccountCommandHandler(
            financeAccountRepository: $this->repository,
            needleDataQuery: new InMemoryDeleteFinanceAccountNeedleDataQuery(
                accountIdsWithTransactions: $accountIdsWithTransactions,
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
