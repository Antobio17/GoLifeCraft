<?php

namespace Economy\Finance\BalanceCheck\Application\Command;

use Economy\Finance\BalanceCheck\Domain\Exception\CreateFinanceBalanceCheckException;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheck;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheckRepository;
use Economy\Finance\BalanceCheck\Domain\QueryModel\CreateFinanceBalanceCheckNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateFinanceBalanceCheckCommandHandler
{
    public function __construct(
        private FinanceBalanceCheckRepository $financeBalanceCheckRepository,
        private CreateFinanceBalanceCheckNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateFinanceBalanceCheckCommand $command): void
    {
        if (!$this->needleDataQuery->accountExists(accountId: $command->accountId)) {
            throw CreateFinanceBalanceCheckException::accountNotFound(accountId: $command->accountId);
        }

        $alreadyExists = $this->needleDataQuery->alreadyExists(
            accountId: $command->accountId,
            checkDate: $command->checkDate,
        );

        if ($alreadyExists) {
            throw CreateFinanceBalanceCheckException::alreadyExists(
                accountId: $command->accountId,
                checkDate: $command->checkDate,
            );
        }

        $financeBalanceCheck = FinanceBalanceCheck::create(
            id: $this->financeBalanceCheckRepository->nextId(),
            accountId: $command->accountId,
            checkDate: $command->checkDate,
            amount: $command->amount,
            note: $command->note,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeBalanceCheckRepository->save(financeBalanceCheck: $financeBalanceCheck);
        $this->domainEventCollectorService->register(aggregate: $financeBalanceCheck);
    }
}
