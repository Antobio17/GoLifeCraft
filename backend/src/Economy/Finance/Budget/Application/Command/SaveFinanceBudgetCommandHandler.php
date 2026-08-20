<?php

namespace Economy\Finance\Budget\Application\Command;

use Economy\Finance\Budget\Domain\Model\FinanceBudget;
use Economy\Finance\Budget\Domain\Model\FinanceBudgetRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class SaveFinanceBudgetCommandHandler
{
    public function __construct(
        private FinanceBudgetRepository $financeBudgetRepository,
        private FinanceBudgetCategoryAssembler $financeBudgetCategoryAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(SaveFinanceBudgetCommand $command): void
    {
        $financeBudget = $this->financeBudgetRepository->findCurrent();

        if (null === $financeBudget) {
            $this->createBudget(command: $command);

            return;
        }

        $financeBudget->update(
            referenceIncome: $command->referenceIncome,
            savingsPercentage: $command->savingsPercentage,
            categories: $this->financeBudgetCategoryAssembler->assemble(
                budgetId: $financeBudget->id,
                categories: $command->categories,
                userId: $command->savedByUserId,
            ),
            updatedByUserId: $command->savedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeBudgetRepository->save(financeBudget: $financeBudget);
        $this->domainEventCollectorService->register(aggregate: $financeBudget);
    }

    private function createBudget(SaveFinanceBudgetCommand $command): void
    {
        $budgetId = $this->financeBudgetRepository->nextId();

        $financeBudget = FinanceBudget::create(
            id: $budgetId,
            referenceIncome: $command->referenceIncome,
            savingsPercentage: $command->savingsPercentage,
            categories: $this->financeBudgetCategoryAssembler->assemble(
                budgetId: $budgetId,
                categories: $command->categories,
                userId: $command->savedByUserId,
            ),
            createdByUserId: $command->savedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->financeBudgetRepository->save(financeBudget: $financeBudget);
        $this->domainEventCollectorService->register(aggregate: $financeBudget);
    }
}
