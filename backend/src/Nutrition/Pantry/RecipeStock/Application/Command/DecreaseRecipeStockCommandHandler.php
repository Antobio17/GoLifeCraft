<?php

namespace Nutrition\Pantry\RecipeStock\Application\Command;

use Nutrition\Pantry\RecipeStock\Domain\Exception\UpdateRecipeStockException;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStock;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStockRepository;
use Nutrition\Pantry\RecipeStock\Domain\QueryModel\UpdateRecipeStockNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DecreaseRecipeStockCommandHandler
{
    public function __construct(
        private RecipeStockRepository $recipeStockRepository,
        private UpdateRecipeStockNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DecreaseRecipeStockCommand $command): void
    {
        if (!$this->needleDataQuery->recipeExists(recipeId: $command->recipeId)) {
            throw UpdateRecipeStockException::recipeNotFound(recipeId: $command->recipeId);
        }

        $recipeStock = $this->recipeStockRepository->findByRecipeId(recipeId: $command->recipeId)
            ?? RecipeStock::start(
                id: $this->recipeStockRepository->nextId(),
                recipeId: $command->recipeId,
                servings: 0.0,
                createdByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

        $recipeStock->decrease(
            servings: $command->servings,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->recipeStockRepository->save(recipeStock: $recipeStock);
        $this->domainEventCollectorService->register(aggregate: $recipeStock);
    }
}
