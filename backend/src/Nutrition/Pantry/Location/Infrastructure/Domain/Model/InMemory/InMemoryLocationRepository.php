<?php

namespace Nutrition\Pantry\Location\Infrastructure\Domain\Model\InMemory;

use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Domain\Model\LocationRepository;

final class InMemoryLocationRepository implements LocationRepository
{
    /** @var Location[] */
    private array $locations = [];

    private int $generatedIds = 0;

    public function nextId(): string
    {
        return 'pantry-location-'.(++$this->generatedIds);
    }

    public function findById(string $id): ?Location
    {
        foreach ($this->locations as $location) {
            if ($location->id === $id) {
                return $location;
            }
        }

        return null;
    }

    public function save(Location $location): void
    {
        foreach ($this->locations as $key => $existing) {
            if ($existing->id === $location->id) {
                $this->locations[$key] = $location;

                return;
            }
        }

        $this->locations[] = $location;
    }

    public function delete(Location $location): void
    {
        foreach ($this->locations as $key => $existing) {
            if ($existing->id === $location->id) {
                unset($this->locations[$key]);

                return;
            }
        }
    }
}
