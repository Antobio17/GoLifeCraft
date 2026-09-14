<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Pantry\Inventory\Application\Command\StartInventoryCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'start_inventory',
    description: 'Open a stock count of the pantry. It takes the walk-through list of every location that currently holds something, with the quantity the app believes is in it, and leaves the count in "draft" so it can be filled in. Only one count can be open at a time, and a count is refused when no location holds anything. Read the count back with query_model on the alias "inventory" filtered by status "draft", and its lines through "inventory_location" and "inventory_location_item". Counting the items and validating the count happen from the app: validating is what overwrites the stock.',
)]
final class StartInventoryTool extends McpMessengerTool
{
    /**
     * @param string $countedOn Day the pantry is walked through, as "YYYY-MM-DD"
     * @param string $shift     "morning" for a count that is the truth at 00:00, so everything bought, cooked or eaten that same day is added on top of it; "afternoon" for the truth at 23:59, so that same day's movements are already inside the number
     * @param string $note      Free note about the count, for example "faltaba el cajón del congelador"
     */
    public function __invoke(
        string $countedOn,
        string $shift,
        string $note = '',
    ): array {
        return $this->dispatch(messageFactory: fn () => new StartInventoryCommand(
            countedOn: $countedOn,
            shift: $shift,
            note: $note,
            startedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
