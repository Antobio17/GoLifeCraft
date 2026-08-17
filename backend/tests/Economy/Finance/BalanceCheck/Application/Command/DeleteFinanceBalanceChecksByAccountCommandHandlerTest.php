<?php

namespace App\Tests\Economy\Finance\BalanceCheck\Application\Command;

use Economy\Finance\BalanceCheck\Application\Command\DeleteFinanceBalanceChecksByAccountCommand;
use Economy\Finance\BalanceCheck\Application\Command\DeleteFinanceBalanceChecksByAccountCommandHandler;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheck;
use Economy\Finance\BalanceCheck\Infrastructure\Domain\Model\InMemory\InMemoryFinanceBalanceCheckRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteFinanceBalanceChecksByAccountCommandHandlerTest extends TestCase
{
    private InMemoryFinanceBalanceCheckRepository $repository;
    private DeleteFinanceBalanceChecksByAccountCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceBalanceCheckRepository();
        $this->handler = new DeleteFinanceBalanceChecksByAccountCommandHandler(
            financeBalanceCheckRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $this->repository->save(financeBalanceCheck: $this->buildCheck(id: 'check-1', accountId: 'account-1'));
        $this->repository->save(financeBalanceCheck: $this->buildCheck(id: 'check-2', accountId: 'account-1'));
        $this->repository->save(financeBalanceCheck: $this->buildCheck(id: 'check-3', accountId: 'account-2'));
    }

    public function testItOnlyDeletesTheChecksOfTheGivenAccount(): void
    {
        ($this->handler)(new DeleteFinanceBalanceChecksByAccountCommand(
            accountId: 'account-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: [], actual: $this->repository->findByAccountId(accountId: 'account-1'));
        $this->assertCount(expectedCount: 1, haystack: $this->repository->findByAccountId(accountId: 'account-2'));
    }

    private function buildCheck(string $id, string $accountId): FinanceBalanceCheck
    {
        return FinanceBalanceCheck::create(
            id: $id,
            accountId: $accountId,
            checkDate: '2026-08-'.substr(string: $id, offset: -1).'1',
            amount: 100.0,
            note: '',
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
