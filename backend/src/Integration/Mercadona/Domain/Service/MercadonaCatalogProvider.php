<?php

namespace Integration\Mercadona\Domain\Service;

use Integration\Mercadona\Domain\Model\MercadonaProduct;

interface MercadonaCatalogProvider
{
    /**
     * @return int[]
     */
    public function listProductIds(?int $categoryId = null): array;

    public function fetchProduct(int $id): ?MercadonaProduct;
}
