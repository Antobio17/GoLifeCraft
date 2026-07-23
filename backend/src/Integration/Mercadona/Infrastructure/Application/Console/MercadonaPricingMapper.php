<?php

namespace Integration\Mercadona\Infrastructure\Application\Console;

use Integration\Mercadona\Domain\Model\MercadonaPrice;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticlePricing;

final readonly class MercadonaPricingMapper
{
    public static function toGlobalArticlePricing(MercadonaPrice $price): GlobalArticlePricing
    {
        return new GlobalArticlePricing(
            price: $price->unitPrice,
            bulkPrice: $price->bulkPrice,
            referencePrice: $price->referencePrice,
            referenceFormat: $price->referenceFormat,
            previousPrice: $price->previousUnitPrice,
        );
    }
}
