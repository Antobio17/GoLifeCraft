<?php

namespace Nutrition\Catalog\Article\Domain\Service;

use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftPhoto;

interface BarcodeReader
{
    /**
     * @param ArticleDraftPhoto[] $photos
     */
    public function read(array $photos): ?string;
}
