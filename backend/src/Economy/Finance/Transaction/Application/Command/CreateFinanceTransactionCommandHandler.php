<?php

namespace Economy\Finance\Transaction\Application\Command;

use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Economy\Finance\Transaction\Domain\Model\FinanceTransactionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateFinanceTransactionCommandHandler
{
    public function __construct(
        private FinanceTransactionRepository $financeTransactionRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateFinanceTransactionCommand $command): void
    {
        $financeTransaction = FinanceTransaction::create(
            id: $this->financeTransactionRepository->nextId(),
            transactionDate: $command->transactionDate,
            kind: $command->kind,
            amount: $command->amount,
            category: $command->category,
            note: $command->note,
            store: $command->store,
            recurring: $command->recurring,
            source: $command->source,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeTransactionRepository->save(financeTransaction: $financeTransaction);
        $this->domainEventCollectorService->register(aggregate: $financeTransaction);
    }
}
