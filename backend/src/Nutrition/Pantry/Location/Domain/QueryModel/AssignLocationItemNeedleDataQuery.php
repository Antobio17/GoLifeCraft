<?php

namespace Nutrition\Pantry\Location\Domain\QueryModel;

interface AssignLocationItemNeedleDataQuery
{
    public function referenceExists(string $kind, string $refId): bool;

    public function currentLocationId(string $kind, string $refId): ?string;
}
