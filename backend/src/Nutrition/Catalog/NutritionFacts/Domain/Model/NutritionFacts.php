<?php

namespace Nutrition\Catalog\NutritionFacts\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class NutritionFacts extends GenericAggregate
{
    public float $referenceAmount;
    public ?float $calories = null;
    public ?float $protein = null;
    public ?float $carbs = null;
    public ?float $sugars = null;
    public ?float $fat = null;
    public ?float $saturatedFat = null;
    public ?float $fiber = null;
    public ?float $salt = null;

    public static function create(
        float $referenceAmount,
        ?float $calories,
        ?float $protein,
        ?float $carbs,
        ?float $sugars,
        ?float $fat,
        ?float $saturatedFat,
        ?float $fiber,
        ?float $salt,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $nutritionFacts = new self();
        $nutritionFacts->id = Uuid::uuid4()->toString();
        $nutritionFacts->stampCreation(userId: $createdByUserId, now: $dateTimeGenerator->now());
        $nutritionFacts->apply(
            referenceAmount: $referenceAmount,
            calories: $calories,
            protein: $protein,
            carbs: $carbs,
            sugars: $sugars,
            fat: $fat,
            saturatedFat: $saturatedFat,
            fiber: $fiber,
            salt: $salt,
            updatedByUserId: $createdByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );

        return $nutritionFacts;
    }

    public function apply(
        float $referenceAmount,
        ?float $calories,
        ?float $protein,
        ?float $carbs,
        ?float $sugars,
        ?float $fat,
        ?float $saturatedFat,
        ?float $fiber,
        ?float $salt,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->referenceAmount = $referenceAmount;
        $this->calories = $calories;
        $this->protein = $protein;
        $this->carbs = $carbs;
        $this->sugars = $sugars;
        $this->fat = $fat;
        $this->saturatedFat = $saturatedFat;
        $this->fiber = $fiber;
        $this->salt = $salt;
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }
}
