<?php

namespace Economy\Finance\BalanceCheck\Application\Command;

use Economy\Finance\BalanceCheck\Domain\Exception\DeleteFinanceBalanceCheckException;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheckRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteFinanceBalanceCheckCommandHandler
{
    public function __construct(
        private FinanceBalanceCheckRepository $financeBalanceCheckRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteFinanceBalanceCheckCommand $command): void
    {
        $financeBalanceCheck = $this->financeBalanceCheckRepository->findById(id: $command->financeBalanceCheckId);

        if (null === $financeBalanceCheck) {
            throw DeleteFinanceBalanceCheckException::notFound(
                financeBalanceCheckId: $command->financeBalanceCheckId,
            );
        }

        $financeBalanceCheck->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeBalanceCheckRepository->delete(financeBalanceCheck: $financeBalanceCheck);
        $this->domainEventCollectorService->register(aggregate: $financeBalanceCheck);
    }
}
