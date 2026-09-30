<?php

namespace Notification\Notification\Settings\Domain\Model;

enum NotificationType: string
{
    case AgendaAppointmentDayBefore = 'agenda.appointment.dayBefore';
    case AgendaAppointmentUpcoming = 'agenda.appointment.upcoming';
    case NutritionMealBreakfast = 'nutrition.meal.breakfast';
    case NutritionMealLunch = 'nutrition.meal.lunch';
    case NutritionMealSnack = 'nutrition.meal.snack';
    case NutritionMealDinner = 'nutrition.meal.dinner';
    case GymWorkoutStillActive = 'gym.workout.stillActive';

    public const string MODULE_AGENDA = 'agenda';
    public const string MODULE_NUTRITION = 'nutrition';
    public const string MODULE_GYM = 'gym';

    public function module(): string
    {
        return match ($this) {
            self::AgendaAppointmentDayBefore, self::AgendaAppointmentUpcoming => self::MODULE_AGENDA,
            self::NutritionMealBreakfast, self::NutritionMealLunch, self::NutritionMealSnack, self::NutritionMealDinner => self::MODULE_NUTRITION,
            self::GymWorkoutStillActive => self::MODULE_GYM,
        };
    }

    public function usesTime(): bool
    {
        return null !== $this->defaultTime();
    }

    public function usesLeadMinutes(): bool
    {
        return self::AgendaAppointmentUpcoming === $this;
    }

    public function usesAfterMinutes(): bool
    {
        return self::GymWorkoutStillActive === $this;
    }

    public function defaultTime(): ?string
    {
        return match ($this) {
            self::AgendaAppointmentDayBefore => '20:00',
            self::NutritionMealBreakfast => '08:30',
            self::NutritionMealLunch => '14:00',
            self::NutritionMealSnack => '17:30',
            self::NutritionMealDinner => '21:00',
            self::AgendaAppointmentUpcoming, self::GymWorkoutStillActive => null,
        };
    }

    public function meal(): ?string
    {
        return match ($this) {
            self::NutritionMealBreakfast => 'breakfast',
            self::NutritionMealLunch => 'lunch',
            self::NutritionMealSnack => 'snack',
            self::NutritionMealDinner => 'dinner',
            self::AgendaAppointmentDayBefore, self::AgendaAppointmentUpcoming, self::GymWorkoutStillActive => null,
        };
    }

    /**
     * @return self[]
     */
    public static function meals(): array
    {
        return array_values(array: array_filter(
            array: self::cases(),
            callback: static fn (self $type): bool => null !== $type->meal(),
        ));
    }

    /**
     * @return string[]
     */
    public static function values(): array
    {
        return array_map(
            callback: static fn (self $type): string => $type->value,
            array: self::cases(),
        );
    }
}
