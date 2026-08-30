<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class RestoreProductionItemIngredientsCommand implements Command
{
    public function __construct(
        public string $productionId,
        public string $itemId,
        public string $restoredByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.production.restore_item_ingredients';
    }
}
