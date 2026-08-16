<?php

namespace Economy\Finance\Transaction\Application\Command;

use Economy\Finance\Transaction\Domain\Exception\DeleteFinanceTransactionException;
use Economy\Finance\Transaction\Domain\Model\FinanceTransactionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteFinanceTransactionCommandHandler
{
    public function __construct(
        private FinanceTransactionRepository $financeTransactionRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteFinanceTransactionCommand $command): void
    {
        $financeTransaction = $this->financeTransactionRepository->findById(id: $command->financeTransactionId);

        if (null === $financeTransaction) {
            throw DeleteFinanceTransactionException::notFound(
                financeTransactionId: $command->financeTransactionId,
            );
        }

        $financeTransaction->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeTransactionRepository->delete(financeTransaction: $financeTransaction);
        $this->domainEventCollectorService->register(aggregate: $financeTransaction);
    }
}
