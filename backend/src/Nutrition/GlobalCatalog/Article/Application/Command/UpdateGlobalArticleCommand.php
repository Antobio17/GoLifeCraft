<?php

namespace Nutrition\GlobalCatalog\Article\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateGlobalArticleCommand implements Command
{
    public function __construct(
        public string $globalArticleId,
        public string $name,
        public ?string $brand,
        public ?string $categoryName,
        public ?string $quantity,
        public ?float $price,
        public ?float $previousPrice,
        public ?float $referencePrice,
        public ?string $referenceFormat,
        public ?float $calories,
        public ?float $protein,
        public ?float $carbs,
        public ?float $sugars,
        public ?float $fat,
        public ?float $saturatedFat,
        public ?float $fiber,
        public ?float $salt,
        public string $updatedByUserId,
        public string $userRole,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.global_article.update';
    }
}
