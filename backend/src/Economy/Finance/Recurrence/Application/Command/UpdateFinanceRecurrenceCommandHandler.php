<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Domain\Exception\UpdateFinanceRecurrenceException;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrenceRepository;
use Economy\Finance\Recurrence\Domain\QueryModel\UpdateFinanceRecurrenceNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateFinanceRecurrenceCommandHandler
{
    public function __construct(
        private FinanceRecurrenceRepository $financeRecurrenceRepository,
        private UpdateFinanceRecurrenceNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateFinanceRecurrenceCommand $command): void
    {
        $financeRecurrence = $this->financeRecurrenceRepository->findById(id: $command->financeRecurrenceId);

        if (null === $financeRecurrence) {
            throw UpdateFinanceRecurrenceException::notFound(
                financeRecurrenceId: $command->financeRecurrenceId,
            );
        }

        if (!$this->needleDataQuery->accountExists(accountId: $command->accountId)) {
            throw UpdateFinanceRecurrenceException::accountNotFound(accountId: $command->accountId);
        }

        $financeRecurrence->update(
            accountId: $command->accountId,
            kind: $command->kind,
            amount: $command->amount,
            category: $command->category,
            note: $command->note,
            store: $command->store,
            dayOfMonth: $command->dayOfMonth,
            startMonth: $command->startMonth,
            endMonth: $command->endMonth,
            active: $command->active,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeRecurrenceRepository->save(financeRecurrence: $financeRecurrence);
        $this->domainEventCollectorService->register(aggregate: $financeRecurrence);
    }
}
