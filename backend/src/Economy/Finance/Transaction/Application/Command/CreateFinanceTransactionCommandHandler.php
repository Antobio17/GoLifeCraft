<?php

namespace Economy\Finance\Transaction\Application\Command;

use Economy\Finance\Transaction\Domain\Exception\CreateFinanceTransactionException;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Economy\Finance\Transaction\Domain\Model\FinanceTransactionRepository;
use Economy\Finance\Transaction\Domain\QueryModel\CreateFinanceTransactionNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateFinanceTransactionCommandHandler
{
    public function __construct(
        private FinanceTransactionRepository $financeTransactionRepository,
        private CreateFinanceTransactionNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateFinanceTransactionCommand $command): void
    {
        if (!$this->needleDataQuery->accountExists(accountId: $command->accountId)) {
            throw CreateFinanceTransactionException::accountNotFound(accountId: $command->accountId);
        }

        if ($this->isRecurrenceAlreadyBooked(command: $command)) {
            return;
        }

        $financeTransaction = FinanceTransaction::create(
            id: $this->financeTransactionRepository->nextId(),
            accountId: $command->accountId,
            transactionDate: $command->transactionDate,
            kind: $command->kind,
            amount: $command->amount,
            category: $command->category,
            note: $command->note,
            store: $command->store,
            source: $command->source,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeTransactionRepository->save(financeTransaction: $financeTransaction);
        $this->domainEventCollectorService->register(aggregate: $financeTransaction);
    }

    private function isRecurrenceAlreadyBooked(CreateFinanceTransactionCommand $command): bool
    {
        if (FinanceTransaction::SOURCE_RECURRENCE !== $command->source) {
            return false;
        }

        return $this->needleDataQuery->recurrenceMovementExists(
            accountId: $command->accountId,
            month: substr(string: $command->transactionDate, offset: 0, length: 7),
            kind: $command->kind,
            amount: $command->amount,
            note: trim(string: $command->note),
        );
    }
}
