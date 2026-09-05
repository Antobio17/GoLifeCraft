<?php

namespace Nutrition\Pantry\Location\Domain\Model;

interface LocationRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Location;

    public function save(Location $location): void;

    public function delete(Location $location): void;
}
