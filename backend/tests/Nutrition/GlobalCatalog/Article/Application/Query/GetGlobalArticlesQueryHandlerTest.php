<?php

namespace App\Tests\Nutrition\GlobalCatalog\Article\Application\Query;

use Nutrition\GlobalCatalog\Article\Application\Query\GetGlobalArticlesQuery;
use Nutrition\GlobalCatalog\Article\Application\Query\GetGlobalArticlesQueryHandler;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticle;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleNutrition;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticlePricing;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticlesResult;
use Nutrition\GlobalCatalog\Article\Infrastructure\Domain\QueryModel\InMemory\InMemoryGetGlobalArticlesNeedleDataQuery;
use Nutrition\GlobalCatalog\Article\Infrastructure\Domain\QueryModel\InMemory\InMemoryImportedArticleBarcodesNeedleDataQuery;
use Nutrition\GlobalCatalog\Article\Infrastructure\UI\API\DataTransform\ApiGetGlobalArticlesDataTransform;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class GetGlobalArticlesQueryHandlerTest extends TestCase
{
    private GetGlobalArticlesQueryHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();

        $this->handler = new GetGlobalArticlesQueryHandler(
            needleDataQuery: new InMemoryGetGlobalArticlesNeedleDataQuery(globalArticles: [
                $this->buildGlobalArticle(barcode: '8480000000017', name: 'Leche semidesnatada', calories: 46.0, dateTimeGenerator: $dateTimeGenerator),
                $this->buildGlobalArticle(barcode: '8480000000048', name: 'Copos de avena', calories: 372.0, dateTimeGenerator: $dateTimeGenerator),
                $this->buildGlobalArticle(barcode: '8430000000003', name: 'Pan rústico', calories: null, dateTimeGenerator: $dateTimeGenerator),
            ]),
            importedArticleBarcodesNeedleDataQuery: new InMemoryImportedArticleBarcodesNeedleDataQuery(barcodes: ['8480000000048']),
            dataTransform: new ApiGetGlobalArticlesDataTransform(),
        );
    }

    public function testItFlagsTheArticlesAlreadyInTheTenantCatalog(): void
    {
        $items = $this->itemsByBarcode(result: ($this->handler)(new GetGlobalArticlesQuery(pageNumber: 1, pageSize: 20)));

        $this->assertTrue($items['8480000000048']->imported);
        $this->assertFalse($items['8480000000017']->imported);
    }

    public function testItHidesTheImportedArticlesWhenAsked(): void
    {
        $result = ($this->handler)(new GetGlobalArticlesQuery(pageNumber: 1, pageSize: 20, filterHideImported: true));

        $this->assertSame(['8480000000017', '8430000000003'], $this->barcodes(result: $result));
        $this->assertSame(2, $result->total);
    }

    public function testItKeepsOnlyTheArticlesWithNutritionWhenAsked(): void
    {
        $result = ($this->handler)(new GetGlobalArticlesQuery(pageNumber: 1, pageSize: 20, filterWithNutrition: true));

        $this->assertSame(['8480000000017', '8480000000048'], $this->barcodes(result: $result));
        $this->assertSame(2, $result->total);
    }

    /**
     * @return string[]
     */
    private function barcodes(QueryCollectionResult $result): array
    {
        return array_map(
            callback: static fn (GetGlobalArticlesResult $item): string => $item->barcode,
            array: $result->items,
        );
    }

    /**
     * @return array<string, GetGlobalArticlesResult>
     */
    private function itemsByBarcode(QueryCollectionResult $result): array
    {
        $items = [];

        foreach ($result->items as $item) {
            $items[$item->barcode] = $item;
        }

        return $items;
    }

    private function buildGlobalArticle(string $barcode, string $name, ?float $calories, DateTimeGenerator $dateTimeGenerator): GlobalArticle
    {
        return GlobalArticle::create(
            id: $barcode,
            barcode: $barcode,
            name: $name,
            brand: 'Hacendado',
            categoryName: 'Despensa',
            imageUrl: null,
            quantity: '1 kg',
            stores: null,
            pricing: GlobalArticlePricing::empty(),
            source: 'mercadona',
            nutrition: new GlobalArticleNutrition(
                referenceAmount: 100.0,
                calories: $calories,
                protein: null,
                carbs: null,
                sugars: null,
                fat: null,
                saturatedFat: null,
                fiber: null,
                salt: null,
            ),
            dateTimeGenerator: $dateTimeGenerator,
        );
    }
}
