<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Domain\Exception\CreateRecipeException;
use Nutrition\Recipe\Recipe\Domain\Model\Recipe;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeRepository;
use Nutrition\Recipe\Recipe\Domain\QueryModel\CreateRecipeNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateRecipeCommandHandler
{
    public function __construct(
        private RecipeRepository $recipeRepository,
        private CreateRecipeNeedleDataQuery $needleDataQuery,
        private RecipeIngredientAssembler $recipeIngredientAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateRecipeCommand $command): void
    {
        if ($this->needleDataQuery->recipeWithNameAlreadyExists(name: $command->name)) {
            throw CreateRecipeException::recipeWithNameAlreadyExists(name: $command->name);
        }

        $recipeId = $this->recipeRepository->nextId();

        $recipe = Recipe::create(
            id: $recipeId,
            name: $command->name,
            emoji: $command->emoji,
            category: $command->category,
            servings: $command->servings,
            ingredients: $this->recipeIngredientAssembler->assemble(
                recipeId: $recipeId,
                ingredients: $command->ingredients,
                userId: $command->createdByUserId,
            ),
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->recipeRepository->save(recipe: $recipe);
        $this->domainEventCollectorService->register(aggregate: $recipe);
    }
}
