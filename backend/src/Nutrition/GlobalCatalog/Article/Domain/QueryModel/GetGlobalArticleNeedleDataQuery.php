<?php

namespace Nutrition\GlobalCatalog\Article\Domain\QueryModel;

use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticleResult;

interface GetGlobalArticleNeedleDataQuery
{
    /**
     * @param string[] $importedBarcodes
     */
    public function findGlobalArticleById(string $globalArticleId, array $importedBarcodes = []): ?GetGlobalArticleResult;
}
