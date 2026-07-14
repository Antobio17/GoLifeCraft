<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RecipeIngredientAssembler
{
    public function __construct(
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * @param RecipeIngredientData[] $ingredients
     *
     * @return RecipeIngredient[]
     */
    public function assemble(string $recipeId, array $ingredients, string $userId): array
    {
        return array_map(
            callback: fn (RecipeIngredientData $ingredientData): RecipeIngredient => RecipeIngredient::create(
                recipeId: $recipeId,
                kind: $ingredientData->kind,
                refId: $ingredientData->refId,
                quantity: $ingredientData->quantity,
                position: $ingredientData->position,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            ),
            array: $ingredients,
        );
    }
}
