<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

final readonly class ArticleDraftPhoto
{
    public function __construct(
        public string $path,
        public string $mimeType,
    ) {
    }
}
