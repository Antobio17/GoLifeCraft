<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Kitchen\Production\Application\Command\CookProductionItemCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'cook_production_item',
    description: 'Mark one line of a cooking batch as cooked, with the servings that actually came out of the pot. This is what moves stock: the servings go into the recipe stock and the ingredients come out of the article stock, both dated on the day this is called. The plan is only an expectation, so cooking 4 when it said 2 leaves the extra 2 in stock. Cooking the last pending line closes the batch on its own. Find the line with query_model on "production_item" filtered by productionId and status "pending".',
)]
final class CookProductionItemTool extends McpMessengerTool
{
    /**
     * @param string $productionId   Id of the batch the line belongs to
     * @param string $itemId         Id of the production_item line being cooked
     * @param float  $servingsCooked Servings that actually came out, which may differ from what was planned
     */
    public function __invoke(string $productionId, string $itemId, float $servingsCooked): array
    {
        return $this->dispatch(messageFactory: fn () => new CookProductionItemCommand(
            productionId: $productionId,
            itemId: $itemId,
            servingsCooked: $servingsCooked,
            cookedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
