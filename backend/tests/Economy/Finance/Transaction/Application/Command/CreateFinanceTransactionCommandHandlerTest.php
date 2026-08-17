<?php

namespace App\Tests\Economy\Finance\Transaction\Application\Command;

use Economy\Finance\Transaction\Application\Command\CreateFinanceTransactionCommand;
use Economy\Finance\Transaction\Application\Command\CreateFinanceTransactionCommandHandler;
use Economy\Finance\Transaction\Domain\Exception\CreateFinanceTransactionException;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Economy\Finance\Transaction\Infrastructure\Domain\Model\InMemory\InMemoryFinanceTransactionRepository;
use Economy\Finance\Transaction\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateFinanceTransactionNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateFinanceTransactionCommandHandlerTest extends TestCase
{
    private InMemoryFinanceTransactionRepository $repository;
    private CreateFinanceTransactionCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryFinanceTransactionRepository();
        $this->handler = new CreateFinanceTransactionCommandHandler(
            financeTransactionRepository: $this->repository,
            needleDataQuery: new InMemoryCreateFinanceTransactionNeedleDataQuery(accountIds: ['account-1']),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesAnExpense(): void
    {
        ($this->handler)(new CreateFinanceTransactionCommand(
            accountId: 'account-1',
            transactionDate: '2026-07-12',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 25.752,
            category: 'groceries',
            note: '  Compra semanal  ',
            store: '  Mercadona  ',
            recurring: false,
            source: FinanceTransaction::SOURCE_MANUAL,
            createdByUserId: 'god-user-id',
        ));

        $transaction = $this->repository->findById(id: 'finance-transaction-1');

        $this->assertNotNull(actual: $transaction);
        $this->assertSame(expected: 'account-1', actual: $transaction->accountId);
        $this->assertSame(expected: '2026-07-12', actual: $transaction->transactionDate);
        $this->assertSame(expected: FinanceTransaction::KIND_EXPENSE, actual: $transaction->kind);
        $this->assertSame(expected: 25.75, actual: $transaction->amount);
        $this->assertSame(expected: 'groceries', actual: $transaction->category);
        $this->assertSame(expected: 'Compra semanal', actual: $transaction->note);
        $this->assertSame(expected: 'Mercadona', actual: $transaction->store);
        $this->assertFalse(condition: $transaction->recurring);
        $this->assertSame(expected: FinanceTransaction::SOURCE_MANUAL, actual: $transaction->source);
    }

    public function testItCreatesARecurringExpense(): void
    {
        ($this->handler)(new CreateFinanceTransactionCommand(
            accountId: 'account-1',
            transactionDate: '2026-07-01',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 12.99,
            category: 'subscriptions',
            note: 'Netflix',
            store: null,
            recurring: true,
            source: FinanceTransaction::SOURCE_MANUAL,
            createdByUserId: 'god-user-id',
        ));

        $transaction = $this->repository->findById(id: 'finance-transaction-1');

        $this->assertNotNull(actual: $transaction);
        $this->assertTrue(condition: $transaction->recurring);
        $this->assertNull(actual: $transaction->store);
    }

    public function testItForcesIncomeToTheOtherCategoryAndNeverRecurring(): void
    {
        ($this->handler)(new CreateFinanceTransactionCommand(
            accountId: 'account-1',
            transactionDate: '2026-07-01',
            kind: FinanceTransaction::KIND_INCOME,
            amount: 1850.0,
            category: 'groceries',
            note: 'Nómina',
            store: 'Nómina',
            recurring: true,
            source: FinanceTransaction::SOURCE_MANUAL,
            createdByUserId: 'god-user-id',
        ));

        $transaction = $this->repository->findById(id: 'finance-transaction-1');

        $this->assertNotNull(actual: $transaction);
        $this->assertSame(expected: FinanceTransaction::CATEGORY_OTHER, actual: $transaction->category);
        $this->assertFalse(condition: $transaction->recurring);
    }

    public function testItThrowsWhenTheAccountDoesNotExist(): void
    {
        $this->expectException(exception: CreateFinanceTransactionException::class);

        ($this->handler)(new CreateFinanceTransactionCommand(
            accountId: 'unknown-account',
            transactionDate: '2026-07-12',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 10.0,
            category: 'groceries',
            note: 'Compra',
            store: null,
            recurring: false,
            source: FinanceTransaction::SOURCE_MANUAL,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenAmountIsNotPositive(): void
    {
        $this->expectException(exception: CreateFinanceTransactionException::class);

        ($this->handler)(new CreateFinanceTransactionCommand(
            accountId: 'account-1',
            transactionDate: '2026-07-12',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 0.0,
            category: 'groceries',
            note: 'Compra',
            store: null,
            recurring: false,
            source: FinanceTransaction::SOURCE_MANUAL,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenDateIsInvalid(): void
    {
        $this->expectException(exception: CreateFinanceTransactionException::class);

        ($this->handler)(new CreateFinanceTransactionCommand(
            accountId: 'account-1',
            transactionDate: '12-07-2026',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 10.0,
            category: 'groceries',
            note: 'Compra',
            store: null,
            recurring: false,
            source: FinanceTransaction::SOURCE_MANUAL,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenKindIsNotSupported(): void
    {
        $this->expectException(exception: CreateFinanceTransactionException::class);

        ($this->handler)(new CreateFinanceTransactionCommand(
            accountId: 'account-1',
            transactionDate: '2026-07-12',
            kind: 'transfer',
            amount: 10.0,
            category: 'groceries',
            note: 'Compra',
            store: null,
            recurring: false,
            source: FinanceTransaction::SOURCE_MANUAL,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenCategoryIsNotSupported(): void
    {
        $this->expectException(exception: CreateFinanceTransactionException::class);

        ($this->handler)(new CreateFinanceTransactionCommand(
            accountId: 'account-1',
            transactionDate: '2026-07-12',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 10.0,
            category: 'crypto',
            note: 'Compra',
            store: null,
            recurring: false,
            source: FinanceTransaction::SOURCE_MANUAL,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenSourceIsNotSupported(): void
    {
        $this->expectException(exception: CreateFinanceTransactionException::class);

        ($this->handler)(new CreateFinanceTransactionCommand(
            accountId: 'account-1',
            transactionDate: '2026-07-12',
            kind: FinanceTransaction::KIND_EXPENSE,
            amount: 10.0,
            category: 'groceries',
            note: 'Compra',
            store: null,
            recurring: false,
            source: 'import',
            createdByUserId: 'god-user-id',
        ));
    }
}
