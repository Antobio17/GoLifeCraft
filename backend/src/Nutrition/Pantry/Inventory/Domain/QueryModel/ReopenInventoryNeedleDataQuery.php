<?php

namespace Nutrition\Pantry\Inventory\Domain\QueryModel;

interface ReopenInventoryNeedleDataQuery
{
    public function openInventoryId(): ?string;
}
