<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticle;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticlesResult;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\GetGlobalArticlesNeedleDataQuery;

final class InMemoryGetGlobalArticlesNeedleDataQuery implements GetGlobalArticlesNeedleDataQuery
{
    /**
     * @param GlobalArticle[] $globalArticles
     */
    public function __construct(private array $globalArticles = [])
    {
    }

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
    ): array {
        $matching = $this->filter(
            filterName: $filterName,
            filterSource: $filterSource,
            filterCategory: $filterCategory,
            filterWithNutrition: $filterWithNutrition,
            excludedBarcodes: $excludedBarcodes,
        );

        return array_map(
            callback: static fn (GlobalArticle $globalArticle): GetGlobalArticlesResult => new GetGlobalArticlesResult(
                id: $globalArticle->id,
                aggregateName: 'GlobalArticle',
                barcode: $globalArticle->barcode,
                name: $globalArticle->name,
                brand: $globalArticle->brand,
                categoryName: $globalArticle->categoryName,
                imageUrl: $globalArticle->imageUrl,
                quantity: $globalArticle->quantity,
                stores: $globalArticle->stores,
                price: $globalArticle->price,
                bulkPrice: $globalArticle->bulkPrice,
                referencePrice: $globalArticle->referencePrice,
                referenceFormat: $globalArticle->referenceFormat,
                previousPrice: $globalArticle->previousPrice,
                source: $globalArticle->source,
                referenceAmount: $globalArticle->referenceAmount,
                calories: $globalArticle->calories,
                protein: $globalArticle->protein,
                carbs: $globalArticle->carbs,
                sugars: $globalArticle->sugars,
                fat: $globalArticle->fat,
                saturatedFat: $globalArticle->saturatedFat,
                fiber: $globalArticle->fiber,
                salt: $globalArticle->salt,
                createdAt: $globalArticle->createdAt,
                updatedAt: $globalArticle->updatedAt,
                createdByUserId: $globalArticle->createdByUserId,
                updatedByUserId: $globalArticle->updatedByUserId,
                imported: in_array(needle: $globalArticle->barcode, haystack: $importedBarcodes, strict: true),
            ),
            array: array_slice(array: $matching, offset: ($pageNumber - 1) * $pageSize, length: $pageSize),
        );
    }

    public function totalGlobalArticles(
        ?string $filterName = null,
        ?string $filterSource = null,
        ?string $filterCategory = null,
        bool $filterWithNutrition = false,
        array $excludedBarcodes = [],
    ): int {
        return count(value: $this->filter(
            filterName: $filterName,
            filterSource: $filterSource,
            filterCategory: $filterCategory,
            filterWithNutrition: $filterWithNutrition,
            excludedBarcodes: $excludedBarcodes,
        ));
    }

    /**
     * @param string[] $excludedBarcodes
     *
     * @return GlobalArticle[]
     */
    private function filter(
        ?string $filterName,
        ?string $filterSource,
        ?string $filterCategory,
        bool $filterWithNutrition,
        array $excludedBarcodes,
    ): array {
        return array_values(array: array_filter(
            array: $this->globalArticles,
            callback: static fn (GlobalArticle $globalArticle): bool => (null === $filterName || str_contains(haystack: mb_strtolower(string: $globalArticle->name), needle: mb_strtolower(string: $filterName)))
                && (null === $filterSource || $globalArticle->source === $filterSource)
                && (null === $filterCategory || $globalArticle->categoryName === $filterCategory)
                && (!$filterWithNutrition || null !== $globalArticle->calories)
                && !in_array(needle: $globalArticle->barcode, haystack: $excludedBarcodes, strict: true),
        ));
    }
}
