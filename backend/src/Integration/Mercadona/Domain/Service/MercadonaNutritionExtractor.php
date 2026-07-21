<?php

namespace Integration\Mercadona\Domain\Service;

use Integration\Mercadona\Domain\Model\MercadonaNutrition;

interface MercadonaNutritionExtractor
{
    /**
     * @param string[] $imageUrls
     */
    public function extract(array $imageUrls): ?MercadonaNutrition;
}
