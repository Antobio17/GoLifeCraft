<?php

namespace App\Tests\Economy\Finance\Transaction\Application\Command;

use Economy\Finance\Transaction\Application\Command\DeleteFinanceTransactionCommand;
use Economy\Finance\Transaction\Application\Command\DeleteFinanceTransactionCommandHandler;
use Economy\Finance\Transaction\Domain\Exception\DeleteFinanceTransactionException;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Economy\Finance\Transaction\Infrastructure\Domain\Model\InMemory\InMemoryFinanceTransactionRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteFinanceTransactionCommandHandlerTest extends TestCase
{
    private InMemoryFinanceTransactionRepository $repository;
    private DeleteFinanceTransactionCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceTransactionRepository();
        $this->handler = new DeleteFinanceTransactionCommandHandler(
            financeTransactionRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $this->repository->save(financeTransaction: FinanceTransaction::create(
            id: 'finance-transaction-1',
            accountId: 'account-1',
            transactionDate: '2026-07-12',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 25.75,
            category: 'groceries',
            note: 'Compra semanal',
            store: 'Mercadona',
            source: FinanceTransaction::SOURCE_MANUAL,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        ));
    }

    public function testItDeletesTheTransaction(): void
    {
        ($this->handler)(new DeleteFinanceTransactionCommand(
            financeTransactionId: 'finance-transaction-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->repository->findById(id: 'finance-transaction-1'));
    }

    public function testItThrowsWhenTheTransactionDoesNotExist(): void
    {
        $this->expectException(exception: DeleteFinanceTransactionException::class);

        ($this->handler)(new DeleteFinanceTransactionCommand(
            financeTransactionId: 'unknown-transaction',
            deletedByUserId: 'god-user-id',
        ));
    }
}
