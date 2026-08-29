<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CheckProductionItemCommand implements Command
{
    /**
     * @param string[] $articleIds
     * @param int[]    $stepPositions
     */
    public function __construct(
        public string $productionId,
        public string $itemId,
        public array $articleIds,
        public array $stepPositions,
        public string $checkedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.production.check_item';
    }
}
