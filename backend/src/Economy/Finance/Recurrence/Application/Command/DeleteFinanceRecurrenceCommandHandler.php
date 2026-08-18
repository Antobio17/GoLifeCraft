<?php

namespace Economy\Finance\Recurrence\Application\Command;

use Economy\Finance\Recurrence\Domain\Exception\DeleteFinanceRecurrenceException;
use Economy\Finance\Recurrence\Domain\Model\FinanceRecurrenceRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteFinanceRecurrenceCommandHandler
{
    public function __construct(
        private FinanceRecurrenceRepository $financeRecurrenceRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteFinanceRecurrenceCommand $command): void
    {
        $financeRecurrence = $this->financeRecurrenceRepository->findById(id: $command->financeRecurrenceId);

        if (null === $financeRecurrence) {
            throw DeleteFinanceRecurrenceException::notFound(
                financeRecurrenceId: $command->financeRecurrenceId,
            );
        }

        $financeRecurrence->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeRecurrenceRepository->delete(financeRecurrence: $financeRecurrence);
        $this->domainEventCollectorService->register(aggregate: $financeRecurrence);
    }
}
