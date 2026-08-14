<?php

namespace Nutrition\Menu\Menu\Domain\Service;

use Nutrition\Menu\Menu\Domain\Model\MenuItemNode;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

interface MenuItemTreeBuilder
{
    /**
     * @param MenuItemNode[] $existingNodes
     *
     * @return MenuItemNode[]
     */
    public function materialize(string $menuItemId, string $recipeId, float $servings, array $existingNodes, string $userId): array;

    /** @param MenuItemNode[] $nodes */
    public function refresh(array $nodes): MacroBreakdown;
}
