<?php

namespace Economy\Finance\BalanceCheck\Application\Command;

use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheckRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteFinanceBalanceChecksByAccountCommandHandler
{
    public function __construct(
        private FinanceBalanceCheckRepository $financeBalanceCheckRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteFinanceBalanceChecksByAccountCommand $command): void
    {
        $financeBalanceChecks = $this->financeBalanceCheckRepository->findByAccountId(
            accountId: $command->accountId,
        );

        foreach ($financeBalanceChecks as $financeBalanceCheck) {
            $financeBalanceCheck->delete(
                deletedByUserId: $command->deletedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->financeBalanceCheckRepository->delete(financeBalanceCheck: $financeBalanceCheck);
            $this->domainEventCollectorService->register(aggregate: $financeBalanceCheck);
        }
    }
}
