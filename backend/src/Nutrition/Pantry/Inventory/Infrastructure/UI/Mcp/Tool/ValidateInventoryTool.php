<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Pantry\Inventory\Application\Command\ValidateInventoryCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'validate_inventory',
    description: 'Close an open count and make it the truth. Every counted line becomes the new balance of that item at the moment of the count, which wipes out whatever the app believed before: nothing has to add up, and a half-used packet counted by eye is a perfectly valid number. Uncounted lines are left alone. A morning count is the truth at 00:00, so everything bought, cooked or eaten that same day lands on top of it; an afternoon count is the truth at 23:59 and already contains that day.',
)]
final class ValidateInventoryTool extends McpMessengerTool
{
    /**
     * @param string $inventoryId Id of the open count to close
     */
    public function __invoke(string $inventoryId): array
    {
        return $this->dispatch(messageFactory: fn () => new ValidateInventoryCommand(
            inventoryId: $inventoryId,
            validatedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
