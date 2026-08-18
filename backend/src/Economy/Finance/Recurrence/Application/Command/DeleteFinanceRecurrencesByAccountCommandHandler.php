<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrenceRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteFinanceRecurrencesByAccountCommandHandler
{
    public function __construct(
        private FinanceRecurrenceRepository $financeRecurrenceRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteFinanceRecurrencesByAccountCommand $command): void
    {
        $financeRecurrences = $this->financeRecurrenceRepository->findByAccountId(
            accountId: $command->accountId,
        );

        foreach ($financeRecurrences as $financeRecurrence) {
            $financeRecurrence->delete(
                deletedByUserId: $command->deletedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->financeRecurrenceRepository->delete(financeRecurrence: $financeRecurrence);
            $this->domainEventCollectorService->register(aggregate: $financeRecurrence);
        }
    }
}
