<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory;

use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;

final class InMemoryProductionRepository implements ProductionRepository
{
    /** @var Production[] */
    private array $productions = [];

    public function nextId(): string
    {
        return 'production-'.(count(value: $this->productions) + 1);
    }

    public function findById(string $id): ?Production
    {
        foreach ($this->productions as $production) {
            if ($production->id === $id) {
                return $production;
            }
        }

        return null;
    }

    public function save(Production $production): void
    {
        foreach ($this->productions as $key => $existing) {
            if ($existing->id === $production->id) {
                $this->productions[$key] = $production;

                return;
            }
        }

        $this->productions[] = $production;
    }

    public function delete(Production $production): void
    {
        foreach ($this->productions as $key => $existing) {
            if ($existing->id === $production->id) {
                unset($this->productions[$key]);

                return;
            }
        }
    }
}
