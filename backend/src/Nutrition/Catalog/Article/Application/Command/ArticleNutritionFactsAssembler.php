<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\NutritionFacts\Domain\Model\NutritionFacts;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ArticleNutritionFactsAssembler
{
    public function __construct(
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function assemble(
        ?NutritionFacts $nutritionFacts,
        ArticleNutritionData $nutrition,
        string $userId,
    ): NutritionFacts {
        if (null === $nutritionFacts) {
            return NutritionFacts::create(
                referenceAmount: $nutrition->referenceAmount,
                calories: $nutrition->calories,
                protein: $nutrition->protein,
                carbs: $nutrition->carbs,
                sugars: $nutrition->sugars,
                fat: $nutrition->fat,
                saturatedFat: $nutrition->saturatedFat,
                fiber: $nutrition->fiber,
                salt: $nutrition->salt,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        $nutritionFacts->apply(
            referenceAmount: $nutrition->referenceAmount,
            calories: $nutrition->calories,
            protein: $nutrition->protein,
            carbs: $nutrition->carbs,
            sugars: $nutrition->sugars,
            fat: $nutrition->fat,
            saturatedFat: $nutrition->saturatedFat,
            fiber: $nutrition->fiber,
            salt: $nutrition->salt,
            updatedByUserId: $userId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        return $nutritionFacts;
    }
}
