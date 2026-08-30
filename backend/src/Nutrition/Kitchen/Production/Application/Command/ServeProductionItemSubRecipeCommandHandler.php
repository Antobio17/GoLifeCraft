<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Domain\Exception\AdjustProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ServeProductionItemSubRecipeCommandHandler
{
    public function __construct(
        private ProductionRepository $productionRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ServeProductionItemSubRecipeCommand $command): void
    {
        $production = $this->productionRepository->findById(id: $command->productionId);
        if (null === $production) {
            throw AdjustProductionItemException::productionNotFound(productionId: $command->productionId);
        }

        $production->serveItemSubRecipeFrom(
            itemId: $command->itemId,
            recipeId: $command->subRecipeId,
            sourceProductionItemId: $command->sourceProductionItemId,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $production);
        $this->domainEventCollectorService->register(aggregate: $production);
    }
}
