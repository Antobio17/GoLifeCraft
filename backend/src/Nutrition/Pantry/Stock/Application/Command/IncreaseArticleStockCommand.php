<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class IncreaseArticleStockCommand implements Command
{
    public function __construct(
        public string $articleId,
        public float $quantity,
        public string $updatedByUserId,
        public ?string $unit = null,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.article_stock.increase';
    }
}
