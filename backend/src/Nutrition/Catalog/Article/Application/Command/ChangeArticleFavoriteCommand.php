<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ChangeArticleFavoriteCommand implements Command
{
    public function __construct(
        public string $articleId,
        public bool $favorite,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.article.change_favorite';
    }
}
