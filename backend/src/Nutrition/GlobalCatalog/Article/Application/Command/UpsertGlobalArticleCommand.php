<?php

namespace Nutrition\GlobalCatalog\Article\Application\Command;

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
        public string $source,
        public float $referenceAmount,
        public ?float $calories,
        public ?float $protein,
        public ?float $carbs,
        public ?float $sugars,
        public ?float $fat,
        public ?float $saturatedFat,
        public ?float $fiber,
        public ?float $salt,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.global_article.upsert';
    }
}
