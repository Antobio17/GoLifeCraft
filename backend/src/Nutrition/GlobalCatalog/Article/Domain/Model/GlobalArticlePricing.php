<?php

namespace Nutrition\GlobalCatalog\Article\Domain\Model;

final readonly class GlobalArticlePricing
{
    public function __construct(
        public ?float $price = null,
        public ?float $bulkPrice = null,
        public ?float $referencePrice = null,
        public ?string $referenceFormat = null,
        public ?float $previousPrice = null,
    ) {
    }

    public static function empty(): self
    {
        return new self();
    }

    public function isEmpty(): bool
    {
        return null === $this->price
            && null === $this->bulkPrice
            && null === $this->referencePrice
            && null === $this->referenceFormat
            && null === $this->previousPrice;
    }
}
