<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProductionThumbnailView
{
    public function __construct(
        public string $recipeId,
        public string $emoji,
        public ?string $image,
    ) {
    }
}
