<?php

namespace Nutrition\Diary\Goal\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Diary\Goal\Domain\Event\DiaryGoalConfigured;
use Nutrition\Diary\Goal\Domain\Exception\DiaryGoalException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class DiaryGoal extends GenericAggregate
{
    public const SINGLETON_ID = 'diary-goal';

    public const DEFAULT_CALORIES = 2100.0;
    public const DEFAULT_PROTEIN = 130.0;
    public const DEFAULT_FAT = 70.0;
    public const DEFAULT_CARBS = 250.0;

    public float $calories;
    public float $protein;
    public float $fat;
    public float $carbs;

    public static function create(
        string $id,
        float $calories,
        float $protein,
        float $fat,
        float $carbs,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        self::guardCalories(calories: $calories);
        self::guardMacro(name: 'protein', value: $protein);
        self::guardMacro(name: 'fat', value: $fat);
        self::guardMacro(name: 'carbs', value: $carbs);

        $now = $dateTimeGenerator->now();

        $goal = new self();
        $goal->id = $id;
        $goal->calories = $calories;
        $goal->protein = $protein;
        $goal->fat = $fat;
        $goal->carbs = $carbs;
        $goal->stampCreation(userId: $createdByUserId, now: $now);

        $goal->record(event: new DiaryGoalConfigured(
            aggregateId: $id,
            occurredOn: $now,
            calories: $calories,
            protein: $protein,
            fat: $fat,
            carbs: $carbs,
        ));

        return $goal;
    }

    public function update(
        float $calories,
        float $protein,
        float $fat,
        float $carbs,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        self::guardCalories(calories: $calories);
        self::guardMacro(name: 'protein', value: $protein);
        self::guardMacro(name: 'fat', value: $fat);
        self::guardMacro(name: 'carbs', value: $carbs);

        $now = $dateTimeGenerator->now();

        $this->calories = $calories;
        $this->protein = $protein;
        $this->fat = $fat;
        $this->carbs = $carbs;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new DiaryGoalConfigured(
            aggregateId: $this->id,
            occurredOn: $now,
            calories: $calories,
            protein: $protein,
            fat: $fat,
            carbs: $carbs,
        ));
    }

    private static function guardCalories(float $calories): void
    {
        if ($calories <= 0) {
            throw DiaryGoalException::caloriesMustBePositive();
        }
    }

    private static function guardMacro(string $name, float $value): void
    {
        if ($value < 0) {
            throw DiaryGoalException::macroMustNotBeNegative(macro: $name);
        }
    }
}
