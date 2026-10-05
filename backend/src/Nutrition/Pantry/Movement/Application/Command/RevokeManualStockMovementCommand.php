<?php

namespace Nutrition\Pantry\Movement\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class RevokeManualStockMovementCommand implements Command
{
    public function __construct(
        public string $movementId,
        public string $revokedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.stock_movement.revoke_manual';
    }
}
