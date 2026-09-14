<?php

namespace Nutrition\Pantry\Location\Domain\QueryModel;

interface PlaceLocationContentsNeedleDataQuery
{
    public function referenceExists(string $kind, string $refId): bool;

    public function currentLocationId(string $kind, string $refId): ?string;
}
