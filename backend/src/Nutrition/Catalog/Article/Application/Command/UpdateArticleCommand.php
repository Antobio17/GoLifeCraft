<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateArticleCommand implements Command
{
    public function __construct(
        public string $articleId,
        public string $name,
        public string $recipeUnit,
        public ?float $servingSize,
        public ?float $price,
        public ?string $brand,
        public ?string $emoji,
        public ?string $categoryId,
        public ?string $supermarketId,
        public ArticleNutritionData $nutrition,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.article.update';
    }
}
