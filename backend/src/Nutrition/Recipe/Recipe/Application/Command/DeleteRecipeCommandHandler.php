<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Domain\Exception\DeleteRecipeException;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteRecipeCommandHandler
{
    public function __construct(
        private RecipeRepository $recipeRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteRecipeCommand $command): void
    {
        $recipe = $this->recipeRepository->findById(id: $command->recipeId);
        if (null === $recipe) {
            throw DeleteRecipeException::recipeNotFound(recipeId: $command->recipeId);
        }

        $recipe->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->recipeRepository->delete(recipe: $recipe);
        $this->domainEventCollectorService->register(aggregate: $recipe);
    }
}
