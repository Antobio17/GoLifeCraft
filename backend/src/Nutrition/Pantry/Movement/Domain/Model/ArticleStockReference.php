<?php

namespace Nutrition\Pantry\Movement\Domain\Model;

final readonly class ArticleStockReference
{
    public function __construct(
        public string $articleId,
        public ?string $packUnit,
        public ?float $packSize,
        public ?float $referenceQuantity,
    ) {
    }

    public function hasPack(): bool
    {
        return null !== $this->packUnit && null !== $this->packSize && $this->packSize > 0.0;
    }

    public function resolve(): ?float
    {
        if ($this->hasPack()) {
            return $this->packSize;
        }

        if (null !== $this->referenceQuantity && $this->referenceQuantity > 0.0) {
            return $this->referenceQuantity;
        }

        return null;
    }
}
