<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Domain\Exception\GenerateFinanceRecurrenceException;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrenceRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class GenerateFinanceRecurrenceCommandHandler
{
    public function __construct(
        private FinanceRecurrenceRepository $financeRecurrenceRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(GenerateFinanceRecurrenceCommand $command): void
    {
        $financeRecurrence = $this->financeRecurrenceRepository->findById(id: $command->financeRecurrenceId);

        if (null === $financeRecurrence) {
            throw GenerateFinanceRecurrenceException::notFound(
                financeRecurrenceId: $command->financeRecurrenceId,
            );
        }

        if (!$financeRecurrence->isPendingFor(month: $command->month, today: $command->today)) {
            return;
        }

        $financeRecurrence->generate(
            month: $command->month,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeRecurrenceRepository->save(financeRecurrence: $financeRecurrence);
        $this->domainEventCollectorService->register(aggregate: $financeRecurrence);
    }
}
