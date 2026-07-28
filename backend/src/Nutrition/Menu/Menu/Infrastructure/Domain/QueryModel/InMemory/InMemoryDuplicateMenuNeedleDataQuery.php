<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuSnapshot;
use Nutrition\Menu\Menu\Domain\QueryModel\DuplicateMenuNeedleDataQuery;

final class InMemoryDuplicateMenuNeedleDataQuery implements DuplicateMenuNeedleDataQuery
{
    /** @var array<string, MenuSnapshot> */
    private array $snapshots = [];

    public function add(MenuSnapshot $snapshot): void
    {
        $this->snapshots[$snapshot->id] = $snapshot;
    }

    public function findMenuSnapshot(string $menuId): ?MenuSnapshot
    {
        return $this->snapshots[$menuId] ?? null;
    }
}
