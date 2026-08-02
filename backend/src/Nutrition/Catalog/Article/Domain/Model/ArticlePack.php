<?php

namespace Nutrition\Catalog\Article\Domain\Model;

final readonly class ArticlePack
{
    private function __construct(
        public ?string $unit,
        public ?float $size,
    ) {
    }

    public static function fromEquivalence(?string $unit, ?float $size): self
    {
        if (null === $unit || null === $size || $size <= 0.0) {
            return new self(unit: null, size: null);
        }

        return new self(unit: $unit, size: $size);
    }

    public function isDefined(): bool
    {
        return null !== $this->unit && null !== $this->size;
    }

    public function packsFor(float $baseQuantity): int
    {
        if (!$this->isDefined() || $baseQuantity <= 0.0) {
            return 1;
        }

        return max(1, (int) ceil($baseQuantity / $this->size));
    }
}
