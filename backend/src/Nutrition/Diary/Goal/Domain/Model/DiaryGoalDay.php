<?php

namespace Nutrition\Diary\Goal\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Diary\Goal\Domain\Exception\DiaryGoalException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class DiaryGoalDay extends GenericAggregate
{
    public string $entryDate;
    public float $calories;
    public float $protein;
    public float $fat;
    public float $carbs;

    public static function create(
        string $id,
        string $entryDate,
        float $calories,
        float $protein,
        float $fat,
        float $carbs,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        self::guard(calories: $calories, protein: $protein, fat: $fat, carbs: $carbs);

        $now = $dateTimeGenerator->now();

        $goalDay = new self();
        $goalDay->id = $id;
        $goalDay->entryDate = $entryDate;
        $goalDay->calories = $calories;
        $goalDay->protein = $protein;
        $goalDay->fat = $fat;
        $goalDay->carbs = $carbs;
        $goalDay->stampCreation(userId: $createdByUserId, now: $now);

        return $goalDay;
    }

    public function update(
        float $calories,
        float $protein,
        float $fat,
        float $carbs,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        self::guard(calories: $calories, protein: $protein, fat: $fat, carbs: $carbs);

        $this->calories = $calories;
        $this->protein = $protein;
        $this->fat = $fat;
        $this->carbs = $carbs;
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    private static function guard(float $calories, float $protein, float $fat, float $carbs): void
    {
        if ($calories <= 0) {
            throw DiaryGoalException::caloriesMustBePositive();
        }

        foreach (['protein' => $protein, 'fat' => $fat, 'carbs' => $carbs] as $macro => $value) {
            if ($value < 0) {
                throw DiaryGoalException::macroMustNotBeNegative(macro: $macro);
            }
        }
    }
}
