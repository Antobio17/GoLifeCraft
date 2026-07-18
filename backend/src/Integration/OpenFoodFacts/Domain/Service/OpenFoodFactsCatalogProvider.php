<?php

namespace Integration\OpenFoodFacts\Domain\Service;

interface OpenFoodFactsCatalogProvider
{
    /**
     * @return \Integration\OpenFoodFacts\Domain\Model\OpenFoodFactsProduct[]
     */
    public function fetchPage(int $page, int $pageSize): array;
}
