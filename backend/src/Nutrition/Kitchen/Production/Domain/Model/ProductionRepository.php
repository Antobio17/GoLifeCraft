<?php

namespace Nutrition\Kitchen\Production\Domain\Model;

interface ProductionRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Production;

    public function save(Production $production): void;

    public function delete(Production $production): void;
}
