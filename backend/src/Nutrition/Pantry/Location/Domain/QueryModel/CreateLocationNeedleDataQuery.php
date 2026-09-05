<?php

namespace Nutrition\Pantry\Location\Domain\QueryModel;

interface CreateLocationNeedleDataQuery
{
    public function alreadyExists(string $name): bool;
}
