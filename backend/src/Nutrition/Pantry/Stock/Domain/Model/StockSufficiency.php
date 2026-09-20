<?php

namespace Nutrition\Pantry\Stock\Domain\Model;

enum StockSufficiency: string
{
    case UNKNOWN = 'unknown';
    case SUFFICIENT = 'sufficient';
    case PROBABLY_SUFFICIENT = 'probably_sufficient';
    case PROBABLY_INSUFFICIENT = 'probably_insufficient';
    case INSUFFICIENT = 'insufficient';

    public function needsShopping(): bool
    {
        return self::SUFFICIENT !== $this && self::PROBABLY_SUFFICIENT !== $this;
    }
}
