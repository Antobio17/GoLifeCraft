<?php

namespace Nutrition\Diary\Diary\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool\McpMessengerTool;
use Mcp\Capability\Attribute\McpTool;
use Nutrition\Diary\Diary\Application\Command\ConsumeDiaryMealCommand;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'consume_diary_meal',
    description: 'Tick a whole meal of one day as eaten, or untick it. Ticking is what takes food out of the pantry: an entry that is planned but not consumed still counts as demand for the kitchen and for the shopping list, and its articles and servings stay in stock. Every night the entries of the days already gone that are still pending are ticked on their own, dated on their day, so this is only needed to take a meal out of the pantry before the day ends. What was not eaten is deleted from the diary, never left unticked, because the nightly run would tick it again. Pass consumed false to undo a tick, which revokes those movements instead of applying the opposite delta.',
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
