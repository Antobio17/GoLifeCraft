<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class AdjustProductionItemIngredientsCommand implements Command
{
    /**
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string}> $ingredients
     */
    public function __construct(
        public string $productionId,
        public string $itemId,
        public array $ingredients,
        public string $adjustedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.production.adjust_item_ingredients';
    }
}
