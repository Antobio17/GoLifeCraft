<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateArticleCommand implements Command
{
    /**
     * @param ArticleEquivalenceData[] $equivalences
     */
    public function __construct(
        public string $articleId,
        public string $name,
        public string $recipeUnit,
        public string $baseUnit,
        public string $diaryUnit,
        public ?string $packUnit,
        public ?float $price,
        public ?string $brand,
        public ?string $emoji,
        public ?string $categoryId,
        public ?string $supermarketId,
        public ?string $aisleId,
        public ArticleNutritionData $nutrition,
        public array $equivalences,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.article.create';
    }
}
