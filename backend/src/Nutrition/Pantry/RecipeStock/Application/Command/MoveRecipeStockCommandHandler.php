<?php

namespace Nutrition\Pantry\RecipeStock\Application\Command;

use Nutrition\Pantry\RecipeStock\Domain\Exception\MoveRecipeStockException;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStock;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStockRepository;
use Nutrition\Pantry\RecipeStock\Domain\QueryModel\MoveRecipeStockNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class MoveRecipeStockCommandHandler
{
    public function __construct(
        private RecipeStockRepository $recipeStockRepository,
        private MoveRecipeStockNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(MoveRecipeStockCommand $command): void
    {
        if (!$this->needleDataQuery->recipeExists(recipeId: $command->recipeId)) {
            throw MoveRecipeStockException::recipeNotFound(recipeId: $command->recipeId);
        }

        if (null !== $command->locationId && !$this->needleDataQuery->locationExists(locationId: $command->locationId)) {
            throw MoveRecipeStockException::locationNotFound(locationId: $command->locationId);
        }

        $recipeStock = $this->recipeStockRepository->findByRecipeId(recipeId: $command->recipeId)
            ?? RecipeStock::start(
                id: $this->recipeStockRepository->nextId(),
                recipeId: $command->recipeId,
                servings: 0.0,
                createdByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

        $recipeStock->moveTo(
            locationId: $command->locationId,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->recipeStockRepository->save(recipeStock: $recipeStock);
        $this->domainEventCollectorService->register(aggregate: $recipeStock);
    }
}
