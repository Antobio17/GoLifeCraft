<?php

namespace Nutrition\Diary\Goal\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
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
}
