<?php

namespace Nutrition\Pantry\RecipeStock\Application\Command;

use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStockRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DecreaseRecipeStockCommandHandler
{
    public function __construct(
        private RecipeStockRepository $recipeStockRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DecreaseRecipeStockCommand $command): void
    {
        $recipeStock = $this->recipeStockRepository->findByRecipeId(recipeId: $command->recipeId);
        if (null === $recipeStock) {
            return;
        }

        $recipeStock->decrease(
            servings: $command->servings,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->recipeStockRepository->save(recipeStock: $recipeStock);
        $this->domainEventCollectorService->register(aggregate: $recipeStock);
    }
}
