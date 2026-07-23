<?php

namespace Integration\Mercadona\Domain\Service;

interface MissingPriceRegistry
{
    public function needsPricing(string $barcode): bool;

    public function isKnown(string $barcode): bool;

    public function countMissingPricing(): int;
}
