<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class StartProductionCommand implements Command
{
    public function __construct(
        public string $recipeId,
        public string $cookDate,
        public float $servingsPlanned,
        public string $startedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.production.start';
    }
}
