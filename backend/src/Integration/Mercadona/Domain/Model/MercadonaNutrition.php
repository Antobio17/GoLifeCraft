<?php

namespace Integration\Mercadona\Domain\Model;

final readonly class MercadonaNutrition
{
    private const float MAX_MACRO = 100.0;
    private const float MAX_CALORIES = 920.0;
    private const float MAX_MASS_SUM = 105.0;
    private const float ALCOHOL_CALORIES_PER_GRAM = 7.0;

    public function __construct(
        public float $referenceAmount,
        public ?float $calories,
        public ?float $protein,
        public ?float $carbs,
        public ?float $sugars,
        public ?float $fat,
        public ?float $saturatedFat,
        public ?float $fiber,
        public ?float $salt,
        public ?float $alcohol = null,
    ) {
    }

    public function hasRequiredMacros(): bool
    {
        return null !== $this->calories
            && null !== $this->protein
            && null !== $this->carbs
            && null !== $this->fat;
    }

    public function isCoherent(): bool
    {
        if (!$this->hasRequiredMacros()) {
            return false;
        }

        if ($this->calories < 0.0 || $this->calories > self::MAX_CALORIES) {
            return false;
        }

        foreach ([$this->protein, $this->carbs, $this->fat, $this->sugars, $this->saturatedFat, $this->fiber, $this->salt, $this->alcohol] as $macro) {
            if (null !== $macro && ($macro < 0.0 || $macro > self::MAX_MACRO)) {
                return false;
            }
        }

        if ((float) $this->protein + (float) $this->carbs + (float) $this->fat > self::MAX_MASS_SUM) {
            return false;
        }

        return $this->matchesAtwater();
    }

    private function matchesAtwater(): bool
    {
        $computed = 4.0 * (float) $this->protein
            + 4.0 * (float) $this->carbs
            + 9.0 * (float) $this->fat
            + 2.0 * ($this->fiber ?? 0.0)
            + self::ALCOHOL_CALORIES_PER_GRAM * ($this->alcohol ?? 0.0);

        $tolerance = max(40.0, 0.30 * (float) $this->calories);

        return abs($computed - (float) $this->calories) <= $tolerance;
    }
}
