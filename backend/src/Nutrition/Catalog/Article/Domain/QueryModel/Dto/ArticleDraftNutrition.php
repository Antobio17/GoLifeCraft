<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

final readonly class ArticleDraftNutrition
{
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
    ) {
    }

    public function isEmpty(): bool
    {
        return null === $this->calories
            && null === $this->protein
            && null === $this->carbs
            && null === $this->sugars
            && null === $this->fat
            && null === $this->saturatedFat
            && null === $this->fiber
            && null === $this->salt;
    }

    public function isCoherent(): bool
    {
        $macros = ($this->protein ?? 0.0) + ($this->carbs ?? 0.0) + ($this->fat ?? 0.0);

        if ($macros > $this->referenceAmount) {
            return false;
        }

        if (null !== $this->sugars && null !== $this->carbs && $this->sugars > $this->carbs) {
            return false;
        }

        if (null !== $this->saturatedFat && null !== $this->fat && $this->saturatedFat > $this->fat) {
            return false;
        }

        return null === $this->calories || $this->calories <= 900.0;
    }
}
