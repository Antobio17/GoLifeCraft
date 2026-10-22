<?php

namespace Nutrition\GlobalCatalog\Article\Application\Query;

use Nutrition\GlobalCatalog\Article\Domain\QueryModel\GetGlobalArticlesNeedleDataQuery;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\ImportedArticleBarcodesNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetGlobalArticlesQueryHandler
{
    public function __construct(
        private GetGlobalArticlesNeedleDataQuery $needleDataQuery,
        private ImportedArticleBarcodesNeedleDataQuery $importedArticleBarcodesNeedleDataQuery,
        private GetGlobalArticlesDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetGlobalArticlesQuery $query): QueryResult
    {
        $importedBarcodes = $this->importedArticleBarcodesNeedleDataQuery->importedBarcodes();
        $excludedBarcodes = $query->filterHideImported ? $importedBarcodes : [];

        return $this->dataTransform->transform(
            globalArticles: $this->needleDataQuery->findGlobalArticles(
                pageSize: $query->pageSize,
                pageNumber: $query->pageNumber,
                importedBarcodes: $importedBarcodes,
                filterName: $query->filterName,
                filterSource: $query->filterSource,
                filterCategory: $query->filterCategory,
                orderBy: $query->orderBy,
                filterWithNutrition: $query->filterWithNutrition,
                excludedBarcodes: $excludedBarcodes,
            ),
            total: $this->needleDataQuery->totalGlobalArticles(
                filterName: $query->filterName,
                filterSource: $query->filterSource,
                filterCategory: $query->filterCategory,
                filterWithNutrition: $query->filterWithNutrition,
                excludedBarcodes: $excludedBarcodes,
            ),
            pageNumber: $query->pageNumber,
            pageSize: $query->pageSize,
        );
    }
}
