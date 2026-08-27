<?php

namespace Nutrition\Recipe\Recipe\Application\Command;

final readonly class RecipeStepData
{
    public function __construct(
        public string $text,
        public int $position,
        public ?int $minutes = null,
    ) {
    }

    public static function fromArray(array $rawStep, int $position): self
    {
        return new self(
            text: trim(string: (string) ($rawStep['text'] ?? '')),
            position: (int) ($rawStep['position'] ?? $position),
            minutes: self::normalizeMinutes(minutes: $rawStep['minutes'] ?? null),
        );
    }

    /**
     * An empty step is not a step: the recipe form leaves blank rows behind while you type.
     * A missing "steps" key is not an empty list either, so it travels as null.
     *
     * @return ?self[]
     */
    public static function listFromArray(?array $rawSteps): ?array
    {
        if (null === $rawSteps) {
            return null;
        }

        $steps = [];

        foreach (array_values(array: $rawSteps) as $index => $rawStep) {
            $step = self::fromArray(rawStep: $rawStep, position: $index + 1);

            if ('' === $step->text) {
                continue;
            }

            $steps[] = $step;
        }

        return $steps;
    }

    private static function normalizeMinutes(mixed $minutes): ?int
    {
        if (null === $minutes || '' === $minutes) {
            return null;
        }

        $minutes = (int) $minutes;

        return $minutes > 0 ? $minutes : null;
    }
}
