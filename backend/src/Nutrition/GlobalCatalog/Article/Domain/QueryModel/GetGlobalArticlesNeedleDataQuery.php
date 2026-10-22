<?php

namespace Nutrition\GlobalCatalog\Article\Domain\QueryModel;

interface GetGlobalArticlesNeedleDataQuery
{
    /**
     * @param string[] $importedBarcodes
     * @param string[] $excludedBarcodes
     */
    public function findGlobalArticles(
        int $pageSize,
        int $pageNumber,
        array $importedBarcodes = [],
        ?string $filterName = null,
        ?string $filterSource = null,
        ?string $filterCategory = null,
        ?string $orderBy = null,
        bool $filterWithNutrition = false,
        array $excludedBarcodes = [],
    ): array;

    /**
     * @param string[] $excludedBarcodes
     */
    public function totalGlobalArticles(
        ?string $filterName = null,
        ?string $filterSource = null,
        ?string $filterCategory = null,
        bool $filterWithNutrition = false,
        array $excludedBarcodes = [],
    ): int;
}
