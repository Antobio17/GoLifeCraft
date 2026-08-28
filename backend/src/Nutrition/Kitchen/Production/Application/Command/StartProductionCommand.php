<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class StartProductionCommand implements Command
{
    /**
     * @param array<int, array{recipeId: string, servings: float}> $items
     */
    public function __construct(
        public string $fromDate,
        public string $toDate,
        public array $items,
        public string $startedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.production.start';
    }
}
