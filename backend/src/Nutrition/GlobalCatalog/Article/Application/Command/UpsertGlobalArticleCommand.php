<?php

namespace Nutrition\GlobalCatalog\Article\Application\Command;

use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleNutrition;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticlePricing;
use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpsertGlobalArticleCommand implements Command
{
    public function __construct(
        public string $barcode,
        public string $name,
        public ?string $brand,
        public ?string $categoryName,
        public ?string $imageUrl,
        public ?string $quantity,
        public ?string $stores,
        public GlobalArticlePricing $pricing,
        public string $source,
        public ?GlobalArticleNutrition $nutrition,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.global_article.upsert';
    }
}
