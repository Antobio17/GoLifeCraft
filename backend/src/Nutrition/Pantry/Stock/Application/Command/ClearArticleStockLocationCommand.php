<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ClearArticleStockLocationCommand implements Command
{
    public function __construct(
        public string $locationId,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.article_stock.clear_location';
    }
}
