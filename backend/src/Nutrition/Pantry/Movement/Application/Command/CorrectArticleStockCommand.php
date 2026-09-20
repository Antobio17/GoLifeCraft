<?php

namespace Nutrition\Pantry\Movement\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CorrectArticleStockCommand implements Command
{
    public function __construct(
        public string $articleId,
        public string $kind,
        public ?float $quantity,
        public ?string $unit,
        public ?string $level,
        public ?string $effectiveAt,
        public string $correctedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.article_stock.correct';
    }
}
