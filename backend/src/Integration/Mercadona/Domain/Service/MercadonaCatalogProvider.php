<?php

namespace Integration\Mercadona\Domain\Service;

use Integration\Mercadona\Domain\Model\MercadonaProduct;

interface MercadonaCatalogProvider
{
    /**
     * @return int[]
     */
    public function listSubcategoryIds(?int $categoryId = null): array;

    /**
     * @return int[]
     */
    public function listProductIdsInSubcategory(int $subcategoryId): array;

    public function fetchProduct(int $id): ?MercadonaProduct;
}
