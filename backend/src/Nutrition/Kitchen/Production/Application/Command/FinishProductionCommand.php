<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class FinishProductionCommand implements Command
{
    public function __construct(
        public string $productionId,
        public string $finishedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.production.finish';
    }
}
