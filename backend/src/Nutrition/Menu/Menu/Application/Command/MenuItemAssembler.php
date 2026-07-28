<?php

namespace Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Domain\Model\MenuItem;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class MenuItemAssembler
{
    public function __construct(
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * @param MenuItemData[] $items
     *
     * @return MenuItem[]
     */
    public function assemble(string $menuId, array $items, string $userId): array
    {
        return array_map(
            callback: fn (MenuItemData $itemData): MenuItem => MenuItem::create(
                menuId: $menuId,
                dayKey: $itemData->dayKey,
                meal: $itemData->meal,
                kind: $itemData->kind,
                refId: $itemData->refId,
                quantity: $itemData->quantity,
                unit: $itemData->unit,
                position: $itemData->position,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            ),
            array: $items,
        );
    }
}
