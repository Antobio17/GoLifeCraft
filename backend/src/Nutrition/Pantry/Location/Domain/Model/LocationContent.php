<?php

namespace Nutrition\Pantry\Location\Domain\Model;

final readonly class LocationContent
{
    public function __construct(
        public string $kind,
        public string $refId,
    ) {
    }
}
