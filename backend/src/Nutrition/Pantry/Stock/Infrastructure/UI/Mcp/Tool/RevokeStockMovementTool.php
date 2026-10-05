<?php

namespace Nutrition\Pantry\Stock\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Pantry\Movement\Application\Command\RevokeManualStockMovementCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'revoke_stock_movement',
    description: 'Undo one stock movement that was registered by hand, as if it had never been made: a correction, a count or a pack added or taken out that turned out to be wrong. The movement leaves the ledger and the stock of its article or recipe is recalculated at once from what remains. Find the movement first with query_model on "stock_movement" filtered by refId, and pick the one whose sourceKind is "manual". Movements that come from an inventory, a purchase ticket, the diary or a production cannot be revoked here: reopen the inventory or change the ticket, diary entry or production instead. To leave the stock at a different amount, prefer correct_article_stock; revoke only what should never have been recorded.',
)]
final class RevokeStockMovementTool extends McpMessengerTool
{
    /**
     * @param string $movementId Id of the manual stock movement to undo
     */
    public function __invoke(string $movementId): array
    {
        return $this->dispatch(messageFactory: fn () => new RevokeManualStockMovementCommand(
            movementId: $movementId,
            revokedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
