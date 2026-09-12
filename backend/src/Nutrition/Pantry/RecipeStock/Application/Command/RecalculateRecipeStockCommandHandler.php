<?php

namespace Nutrition\Pantry\RecipeStock\Application\Command;

use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Service\StockBalanceCalculator;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStock;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStockRepository;
use Nutrition\Pantry\RecipeStock\Domain\QueryModel\UpdateRecipeStockNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RecalculateRecipeStockCommandHandler
{
    public function __construct(
        private RecipeStockRepository $recipeStockRepository,
        private UpdateRecipeStockNeedleDataQuery $needleDataQuery,
        private StockBalanceCalculator $balanceCalculator,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RecalculateRecipeStockCommand $command): void
    {
        if (!$this->needleDataQuery->recipeExists(recipeId: $command->recipeId)) {
            return;
        }

        $servings = $this->balanceCalculator->balanceFor(
            kind: StockMovement::KIND_RECIPE,
            refId: $command->recipeId,
        );

        $recipeStock = $this->recipeStockRepository->findByRecipeId(recipeId: $command->recipeId)
            ?? RecipeStock::start(
                id: $this->recipeStockRepository->nextId(),
                recipeId: $command->recipeId,
                servings: 0.0,
                createdByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

        $recipeStock->change(
            servings: $servings,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->recipeStockRepository->save(recipeStock: $recipeStock);
        $this->domainEventCollectorService->register(aggregate: $recipeStock);
    }
}
