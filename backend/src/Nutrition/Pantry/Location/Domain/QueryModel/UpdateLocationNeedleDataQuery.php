<?php

namespace Nutrition\Pantry\Location\Domain\QueryModel;

interface UpdateLocationNeedleDataQuery
{
    public function alreadyExists(string $name, string $locationId): bool;
}
