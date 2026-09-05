<?php

namespace Nutrition\Pantry\RecipeStock\Application\Command;

use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStockRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ClearRecipeStockLocationCommandHandler
{
    public function __construct(
        private RecipeStockRepository $recipeStockRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ClearRecipeStockLocationCommand $command): void
    {
        foreach ($this->recipeStockRepository->findByLocationId(locationId: $command->locationId) as $recipeStock) {
            $recipeStock->moveTo(
                locationId: null,
                updatedByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->recipeStockRepository->save(recipeStock: $recipeStock);
            $this->domainEventCollectorService->register(aggregate: $recipeStock);
        }
    }
}
