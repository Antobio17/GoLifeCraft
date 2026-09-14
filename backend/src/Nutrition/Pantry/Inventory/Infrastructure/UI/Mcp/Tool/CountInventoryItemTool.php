<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Pantry\Inventory\Application\Command\CountInventoryItemCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'count_inventory_item',
    description: 'Write down what was actually found for one line of an open count. A line left uncounted is not an error and not a zero: validating the count simply leaves that item\'s balance alone, so counting one shelf and ignoring the rest of the house is a perfectly good count. Pass an empty countedQuantity to clear a line that was filled in by mistake. Find the lines with query_model on "inventory_location_item" filtered by inventoryId.',
)]
final class CountInventoryItemTool extends McpMessengerTool
{
    /**
     * @param string  $inventoryId     Id of the open count
     * @param string  $itemId          Id of the inventory_location_item line being counted
     * @param ?float  $countedQuantity What was found, in the base unit of the item. Empty leaves the line uncounted, which keeps that item's current balance untouched
     * @param ?string $countedUnit     Unit the quantity was measured in, when it is not the item's base unit
     */
    public function __invoke(
        string $inventoryId,
        string $itemId,
        ?float $countedQuantity = null,
        ?string $countedUnit = null,
    ): array {
        return $this->dispatch(messageFactory: fn () => new CountInventoryItemCommand(
            inventoryId: $inventoryId,
            itemId: $itemId,
            countedQuantity: $countedQuantity,
            countedUnit: $countedUnit,
            countedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
