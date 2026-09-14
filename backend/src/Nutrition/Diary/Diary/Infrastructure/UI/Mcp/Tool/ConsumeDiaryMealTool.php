<?php

namespace Nutrition\Diary\Diary\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Diary\Diary\Application\Command\ConsumeDiaryMealCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'consume_diary_meal',
    description: 'Tick a whole meal of one day as eaten, or untick it. This is the only thing that takes food out of the pantry: an entry that is planned but not consumed still counts as demand for the kitchen and for the shopping list, and its articles and servings stay in stock. Ticking a past day is the usual way to catch up, and the stock movement is dated on that day, not on today. Pass consumed false to undo it, which revokes those movements instead of applying the opposite delta.',
)]
final class ConsumeDiaryMealTool extends McpMessengerTool
{
    /**
     * @param string $date     Day of the diary, as "YYYY-MM-DD"
     * @param string $meal     Which meal of that day: "breakfast", "lunch", "dinner" or "snack"
     * @param bool   $consumed True to tick the meal as eaten, false to undo it
     */
    public function __invoke(string $date, string $meal, bool $consumed = true): array
    {
        return $this->dispatch(messageFactory: fn () => new ConsumeDiaryMealCommand(
            date: $date,
            meal: $meal,
            consumed: $consumed,
            updatedByUserId: RequestExtractor::getUserSessionId(request: $this->request()),
        ));
    }
}
