<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Domain\Model\RecipeStep;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RecipeStepAssembler
{
    public function __construct(
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * @param RecipeStepData[] $steps
     *
     * @return RecipeStep[]
     */
    public function assemble(string $recipeId, array $steps, string $userId): array
    {
        return array_map(
            callback: fn (RecipeStepData $stepData): RecipeStep => RecipeStep::create(
                recipeId: $recipeId,
                position: $stepData->position,
                text: $stepData->text,
                minutes: $stepData->minutes,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            ),
            array: $steps,
        );
    }
}
