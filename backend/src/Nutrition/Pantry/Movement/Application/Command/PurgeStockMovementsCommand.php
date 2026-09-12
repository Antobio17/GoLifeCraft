<?php

namespace Nutrition\Pantry\Movement\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class PurgeStockMovementsCommand implements Command
{
    public function __construct(
        public string $kind,
        public string $refId,
        public string $purgedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.stock_movement.purge';
    }
}
