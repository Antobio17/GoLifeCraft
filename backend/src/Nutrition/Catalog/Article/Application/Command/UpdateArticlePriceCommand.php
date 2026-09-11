<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateArticlePriceCommand implements Command
{
    public function __construct(
        public string $articleId,
        public ?float $price,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.article.update_price';
    }
}
