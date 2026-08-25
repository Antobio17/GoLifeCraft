<?php

namespace Nutrition\Catalog\Article\Domain\Service;

use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftExtraction;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftGrounding;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftPhoto;

interface ArticleDraftExtractor
{
    /**
     * @param ArticleDraftPhoto[] $photos
     */
    public function extract(array $photos, ArticleDraftGrounding $grounding): ArticleDraftExtraction;
}
