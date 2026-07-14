<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Domain\Exception\UpdateRecipeException;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeRepository;
use Nutrition\Recipe\Recipe\Domain\QueryModel\UpdateRecipeNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateRecipeCommandHandler
{
    public function __construct(
        private RecipeRepository $recipeRepository,
        private UpdateRecipeNeedleDataQuery $needleDataQuery,
        private RecipeIngredientAssembler $recipeIngredientAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateRecipeCommand $command): void
    {
        $recipe = $this->recipeRepository->findById(id: $command->recipeId);
        if (null === $recipe) {
            throw UpdateRecipeException::recipeNotFound(recipeId: $command->recipeId);
        }

        $nameAlreadyExists = $this->needleDataQuery->recipeWithNameAlreadyExists(
            name: $command->name,
            excludingRecipeId: $command->recipeId,
        );
        if ($nameAlreadyExists) {
            throw UpdateRecipeException::recipeWithNameAlreadyExists(name: $command->name);
        }

        $recipe->update(
            name: $command->name,
            emoji: $command->emoji,
            category: $command->category,
            servings: $command->servings,
            ingredients: $this->recipeIngredientAssembler->assemble(
                recipeId: $recipe->id,
                ingredients: $command->ingredients,
                userId: $command->updatedByUserId,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->recipeRepository->save(recipe: $recipe);
        $this->domainEventCollectorService->register(aggregate: $recipe);
    }
}
