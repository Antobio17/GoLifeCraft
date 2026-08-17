<?php

namespace Economy\Finance\BalanceCheck\Application\Command;

use Economy\Finance\BalanceCheck\Domain\Exception\UpdateFinanceBalanceCheckException;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheckRepository;
use Economy\Finance\BalanceCheck\Domain\QueryModel\UpdateFinanceBalanceCheckNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateFinanceBalanceCheckCommandHandler
{
    public function __construct(
        private FinanceBalanceCheckRepository $financeBalanceCheckRepository,
        private UpdateFinanceBalanceCheckNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateFinanceBalanceCheckCommand $command): void
    {
        $financeBalanceCheck = $this->financeBalanceCheckRepository->findById(id: $command->financeBalanceCheckId);

        if (null === $financeBalanceCheck) {
            throw UpdateFinanceBalanceCheckException::notFound(
                financeBalanceCheckId: $command->financeBalanceCheckId,
            );
        }

        $alreadyExists = $this->needleDataQuery->alreadyExists(
            accountId: $financeBalanceCheck->accountId,
            checkDate: $command->checkDate,
            financeBalanceCheckId: $command->financeBalanceCheckId,
        );

        if ($alreadyExists) {
            throw UpdateFinanceBalanceCheckException::alreadyExists(
                accountId: $financeBalanceCheck->accountId,
                checkDate: $command->checkDate,
            );
        }

        $financeBalanceCheck->update(
            checkDate: $command->checkDate,
            amount: $command->amount,
            note: $command->note,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeBalanceCheckRepository->save(financeBalanceCheck: $financeBalanceCheck);
        $this->domainEventCollectorService->register(aggregate: $financeBalanceCheck);
    }
}
