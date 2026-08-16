<?php

namespace App\Tests\Economy\Finance\Transaction\Application\Command;

use Economy\Finance\Transaction\Application\Command\UpdateFinanceTransactionCommand;
use Economy\Finance\Transaction\Application\Command\UpdateFinanceTransactionCommandHandler;
use Economy\Finance\Transaction\Domain\Exception\UpdateFinanceTransactionException;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Economy\Finance\Transaction\Infrastructure\Domain\Model\InMemory\InMemoryFinanceTransactionRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateFinanceTransactionCommandHandlerTest extends TestCase
{
    private InMemoryFinanceTransactionRepository $repository;
    private UpdateFinanceTransactionCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceTransactionRepository();
        $this->handler = new UpdateFinanceTransactionCommandHandler(
            financeTransactionRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $this->repository->save(financeTransaction: FinanceTransaction::create(
            id: 'finance-transaction-1',
            transactionDate: '2026-07-12',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 25.75,
            category: 'groceries',
            note: 'Compra semanal',
            store: 'Mercadona',
            recurring: false,
            source: FinanceTransaction::SOURCE_TICKET,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        ));
    }

    public function testItUpdatesTheTransaction(): void
    {
        ($this->handler)(new UpdateFinanceTransactionCommand(
            financeTransactionId: 'finance-transaction-1',
            transactionDate: '2026-07-14',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 31.2,
            category: 'restaurants',
            note: 'Cena fuera',
            store: 'La Tagliatella',
            recurring: false,
            updatedByUserId: 'god-user-id',
        ));

        $transaction = $this->repository->findById(id: 'finance-transaction-1');

        $this->assertNotNull(actual: $transaction);
        $this->assertSame(expected: '2026-07-14', actual: $transaction->transactionDate);
        $this->assertSame(expected: 31.2, actual: $transaction->amount);
        $this->assertSame(expected: 'restaurants', actual: $transaction->category);
        $this->assertSame(expected: 'Cena fuera', actual: $transaction->note);
    }

    public function testItKeepsTheOriginalSource(): void
    {
        ($this->handler)(new UpdateFinanceTransactionCommand(
            financeTransactionId: 'finance-transaction-1',
            transactionDate: '2026-07-12',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 25.75,
            category: 'groceries',
            note: 'Compra semanal',
            store: 'Mercadona',
            recurring: false,
            updatedByUserId: 'god-user-id',
        ));

        $transaction = $this->repository->findById(id: 'finance-transaction-1');

        $this->assertNotNull(actual: $transaction);
        $this->assertSame(expected: FinanceTransaction::SOURCE_TICKET, actual: $transaction->source);
    }

    public function testItThrowsWhenTheTransactionDoesNotExist(): void
    {
        $this->expectException(exception: UpdateFinanceTransactionException::class);

        ($this->handler)(new UpdateFinanceTransactionCommand(
            financeTransactionId: 'unknown-transaction',
            transactionDate: '2026-07-14',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 10.0,
            category: 'groceries',
            note: 'Compra',
            store: null,
            recurring: false,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenAmountIsNotPositive(): void
    {
        $this->expectException(exception: UpdateFinanceTransactionException::class);

        ($this->handler)(new UpdateFinanceTransactionCommand(
            financeTransactionId: 'finance-transaction-1',
            transactionDate: '2026-07-14',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: -3.0,
            category: 'groceries',
            note: 'Compra',
            store: null,
            recurring: false,
            updatedByUserId: 'god-user-id',
        ));
    }
}
