<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Nutrition\Kitchen\Production\Application\Command\StartProductionCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'start_production',
    description: 'Open a cooking batch covering a range of days, with the recipes to cook in it. One batch is one cooking session plan: the recipes that can be cooked ahead are added up across the whole range, while a recipe whose prepMode is "same_day" is added once per day it is due, so the same recipe may appear several times with different dueDate values. Sub-recipes are planned on their own and cooked first. Read what the diary is asking for with query_model on "diary_entry", what is already in the freezer with "recipe_stock", and the batch itself afterwards with "production" and "production_item". Cooking each line is a separate call to cook_production_item; cooking the last one closes the batch on its own.',
)]
final class StartProductionTool extends McpMessengerTool
{
    /**
     * @param string                                                                  $fromDate First day the batch covers, as "YYYY-MM-DD"
     * @param string                                                                  $toDate   Last day the batch covers, as "YYYY-MM-DD"
     * @param array<int, array{recipeId: string, servings: float, dueDate?: ?string}> $items    Recipes to cook in this batch
     */
    public function __invoke(
        string $fromDate,
        string $toDate,
        #[Schema(
            type: 'array',
            description: 'The lines of the batch. Each one is {"recipeId": "…", "servings": 4, "dueDate": "2026-09-17"}, where dueDate is only for a same_day recipe and is left out for anything cooked ahead.',
            items: [
                'type' => 'object',
                'properties' => [
                    'recipeId' => ['type' => 'string', 'description' => 'Id of the recipe to cook.'],
                    'servings' => ['type' => 'number', 'description' => 'Servings to plan for this line.'],
                    'dueDate' => ['type' => 'string', 'description' => 'Day this line must be cooked, as "YYYY-MM-DD". Only for a same_day recipe.'],
                ],
                'required' => ['recipeId', 'servings'],
            ],
        )]
        array $items,
    ): array {
        return $this->dispatch(messageFactory: fn () => new StartProductionCommand(
            fromDate: $fromDate,
            toDate: $toDate,
            items: self::lines(items: $items),
            startedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }

    /**
     * @param array<int, array<string, mixed>> $items
     *
     * @return array<int, array{recipeId: string, servings: float, dueDate: ?string}>
     */
    private static function lines(array $items): array
    {
        return array_map(callback: static fn (array $item): array => [
            'recipeId' => (string) ($item['recipeId'] ?? ''),
            'servings' => (float) ($item['servings'] ?? 0),
            'dueDate' => isset($item['dueDate']) && '' !== $item['dueDate'] ? (string) $item['dueDate'] : null,
        ], array: $items);
    }
}
