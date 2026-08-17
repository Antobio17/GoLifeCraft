<?php

namespace Economy\Finance\BalanceCheck\Application\Command;

use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheck;
use Economy\Finance\BalanceCheck\Domain\Model\FinanceBalanceCheckRepository;
use Economy\Finance\BalanceCheck\Domain\QueryModel\SetFinanceAccountBalanceNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

/**
 * Counts the money an account holds right now and stores it as the balance
 * check of that day. A check anchors the balance at the start of its day, so
 * the movements already booked on that same date are taken out of the counted
 * figure: the app rebuilds them on top and lands back on what was counted.
 */
final readonly class SetFinanceAccountBalanceCommandHandler
{
    public function __construct(
        private FinanceBalanceCheckRepository $financeBalanceCheckRepository,
        private SetFinanceAccountBalanceNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(SetFinanceAccountBalanceCommand $command): void
    {
        $amount = $command->balance - $this->needleDataQuery->netMovements(
            accountId: $command->accountId,
            checkDate: $command->checkDate,
        );

        $financeBalanceCheck = $this->resolveCheck(command: $command, amount: $amount);

        $this->financeBalanceCheckRepository->save(financeBalanceCheck: $financeBalanceCheck);
        $this->domainEventCollectorService->register(aggregate: $financeBalanceCheck);
    }

    private function resolveCheck(SetFinanceAccountBalanceCommand $command, float $amount): FinanceBalanceCheck
    {
        $financeBalanceCheck = $this->financeBalanceCheckRepository->findByAccountIdAndCheckDate(
            accountId: $command->accountId,
            checkDate: $command->checkDate,
        );

        if (null === $financeBalanceCheck) {
            return FinanceBalanceCheck::create(
                id: $this->financeBalanceCheckRepository->nextId(),
                accountId: $command->accountId,
                checkDate: $command->checkDate,
                amount: $amount,
                note: $command->note,
                createdByUserId: $command->setByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        $financeBalanceCheck->update(
            checkDate: $command->checkDate,
            amount: $amount,
            note: $this->keepNote(incoming: $command->note, current: $financeBalanceCheck->note),
            updatedByUserId: $command->setByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        return $financeBalanceCheck;
    }

    private function keepNote(string $incoming, string $current): string
    {
        if ('' === trim(string: $incoming)) {
            return $current;
        }

        return $incoming;
    }
}
