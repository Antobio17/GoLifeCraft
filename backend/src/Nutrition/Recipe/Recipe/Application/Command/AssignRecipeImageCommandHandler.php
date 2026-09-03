<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Domain\Exception\AssignRecipeImageException;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Shared\Tool\Tool\Domain\Service\ImageStorageService;

final readonly class AssignRecipeImageCommandHandler
{
    private const string IMAGE_AGGREGATE = 'recipe';

    public function __construct(
        private RecipeRepository $recipeRepository,
        private ImageStorageService $imageStorageService,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(AssignRecipeImageCommand $command): void
    {
        $recipe = $this->recipeRepository->findById(id: $command->recipeId);

        if (null === $recipe) {
            throw AssignRecipeImageException::recipeNotFound(recipeId: $command->recipeId);
        }

        $this->imageStorageService->deleteAggregateImage(
            aggregate: self::IMAGE_AGGREGATE,
            aggregateId: $recipe->id,
            image: $recipe->image,
        );

        $recipe->assignImage(
            image: null === $command->imagePath ? null : $this->imageStorageService->storeAggregateImage(
                aggregate: self::IMAGE_AGGREGATE,
                aggregateId: $recipe->id,
                imagePath: $command->imagePath,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->recipeRepository->save(recipe: $recipe);
        $this->domainEventCollectorService->register(aggregate: $recipe);
    }
}
