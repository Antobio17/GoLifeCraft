<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class SetArticleStockTrackingCommand implements Command
{
    public function __construct(
        public string $articleId,
        public string $trackingMode,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.article_stock.set_tracking';
    }
}
