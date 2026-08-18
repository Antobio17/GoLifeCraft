<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Domain\Exception\CreateFinanceRecurrenceException;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrence;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrenceRepository;
use Economy\Finance\Recurrence\Domain\QueryModel\CreateFinanceRecurrenceNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateFinanceRecurrenceCommandHandler
{
    public function __construct(
        private FinanceRecurrenceRepository $financeRecurrenceRepository,
        private CreateFinanceRecurrenceNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateFinanceRecurrenceCommand $command): void
    {
        if (!$this->needleDataQuery->accountExists(accountId: $command->accountId)) {
            throw CreateFinanceRecurrenceException::accountNotFound(accountId: $command->accountId);
        }

        $financeRecurrence = FinanceRecurrence::create(
            id: $this->financeRecurrenceRepository->nextId(),
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
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeRecurrenceRepository->save(financeRecurrence: $financeRecurrence);
        $this->domainEventCollectorService->register(aggregate: $financeRecurrence);
    }
}
