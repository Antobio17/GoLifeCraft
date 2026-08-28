<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UncookProductionItemCommand implements Command
{
    public function __construct(
        public string $productionId,
        public string $itemId,
        public string $uncookedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.production.uncook_item';
    }
}
