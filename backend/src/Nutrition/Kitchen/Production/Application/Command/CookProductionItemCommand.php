<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CookProductionItemCommand implements Command
{
    public function __construct(
        public string $productionId,
        public string $itemId,
        public float $servingsCooked,
        public string $cookedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.production.cook_item';
    }
}
