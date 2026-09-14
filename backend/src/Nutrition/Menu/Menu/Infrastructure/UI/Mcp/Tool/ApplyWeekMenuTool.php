<?php

namespace Nutrition\Menu\Menu\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Menu\Menu\Application\Command\ApplyWeekMenuCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'apply_week_menu',
    description: 'Write a whole week of a saved menu into the diary, day by day, starting on the given Monday. This is what turns a menu template into actual planned days, and everything downstream reads those days: the kitchen works out what to cook from them and the shopping needs are added up from them. Find the menu with query_model on the alias "menu", and check what landed with query_model on "diary_entry" filtered by entryDate.',
)]
final class ApplyWeekMenuTool extends McpMessengerTool
{
    /**
     * @param string $menuId        Id of the menu to apply
     * @param string $weekStartDate Monday the week starts on, as "YYYY-MM-DD"
     */
    public function __invoke(string $menuId, string $weekStartDate): array
    {
        return $this->dispatch(messageFactory: fn () => new ApplyWeekMenuCommand(
            menuId: $menuId,
            weekStartDate: $weekStartDate,
            loadedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
