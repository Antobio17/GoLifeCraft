<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Domain\Exception\AdjustProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Nutrition\Kitchen\Production\Domain\Service\ProductionCompositionResolver;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RestoreProductionItemIngredientsCommandHandler
{
    public function __construct(
        private ProductionRepository $productionRepository,
        private ProductionCompositionResolver $compositionResolver,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RestoreProductionItemIngredientsCommand $command): void
    {
        $production = $this->productionRepository->findById(id: $command->productionId);
        if (null === $production) {
            throw AdjustProductionItemException::productionNotFound(productionId: $command->productionId);
        }

        $item = $production->item(itemId: $command->itemId);
        if (null === $item) {
            throw AdjustProductionItemException::itemNotFound(
                productionId: $command->productionId,
                itemId: $command->itemId,
            );
        }

        $production->adjustItemIngredients(
            itemId: $command->itemId,
            composition: $this->compositionResolver->fromRecipe(
                recipeId: $item->recipeId,
                servings: $item->servingsPlanned,
            ),
            customized: false,
            adjustedByUserId: $command->restoredByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $production);
        $this->domainEventCollectorService->register(aggregate: $production);
    }
}
