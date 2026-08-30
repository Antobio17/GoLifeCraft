<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class LabelProductionItemCommand implements Command
{
    public function __construct(
        public string $productionId,
        public string $itemId,
        public string $label,
        public string $labelledByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.production.label_item';
    }
}
