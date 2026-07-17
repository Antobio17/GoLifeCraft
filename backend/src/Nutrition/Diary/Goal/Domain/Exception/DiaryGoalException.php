<?php

namespace Nutrition\Diary\Goal\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class DiaryGoalException extends BaseException
{
    public static function caloriesMustBePositive(): self
    {
        return new static(
            title: 'The calorie goal must be greater than zero.',
            keyTranslation: 'diary.goal.calories.must.be.positive',
            details: []
        );
    }

    public static function macroMustNotBeNegative(string $macro): self
    {
        return new static(
            title: 'The macronutrient goal must not be negative.',
            keyTranslation: 'diary.goal.macro.must.not.be.negative',
            details: ['macro' => $macro]
        );
    }
}
