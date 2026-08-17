<?php

namespace Economy\Finance\Transaction\Application\Command;

use Economy\Finance\Transaction\Domain\Exception\UpdateFinanceTransactionException;
use Economy\Finance\Transaction\Domain\Model\FinanceTransactionRepository;
use Economy\Finance\Transaction\Domain\QueryModel\UpdateFinanceTransactionNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateFinanceTransactionCommandHandler
{
    public function __construct(
        private FinanceTransactionRepository $financeTransactionRepository,
        private UpdateFinanceTransactionNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateFinanceTransactionCommand $command): void
    {
        $financeTransaction = $this->financeTransactionRepository->findById(id: $command->financeTransactionId);

        if (null === $financeTransaction) {
            throw UpdateFinanceTransactionException::notFound(
                financeTransactionId: $command->financeTransactionId,
            );
        }

        if (!$this->needleDataQuery->accountExists(accountId: $command->accountId)) {
            throw UpdateFinanceTransactionException::accountNotFound(accountId: $command->accountId);
        }

        $financeTransaction->update(
            accountId: $command->accountId,
            transactionDate: $command->transactionDate,
            kind: $command->kind,
            amount: $command->amount,
            category: $command->category,
            note: $command->note,
            store: $command->store,
            recurring: $command->recurring,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeTransactionRepository->save(financeTransaction: $financeTransaction);
        $this->domainEventCollectorService->register(aggregate: $financeTransaction);
    }
}
