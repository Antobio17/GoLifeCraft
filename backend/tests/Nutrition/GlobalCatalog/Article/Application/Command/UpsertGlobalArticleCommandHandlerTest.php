<?php

namespace App\Tests\Nutrition\GlobalCatalog\Article\Application\Command;

use Nutrition\GlobalCatalog\Article\Application\Command\UpsertGlobalArticleCommand;
use Nutrition\GlobalCatalog\Article\Application\Command\UpsertGlobalArticleCommandHandler;
use Nutrition\GlobalCatalog\Article\Domain\Exception\UpsertGlobalArticleException;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleNutrition;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticlePricing;
use Nutrition\GlobalCatalog\Article\Infrastructure\Domain\Model\InMemory\InMemoryGlobalArticleRepository;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpsertGlobalArticleCommandHandlerTest extends TestCase
{
    private InMemoryGlobalArticleRepository $repository;
    private UpsertGlobalArticleCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryGlobalArticleRepository();
        $this->handler = new UpsertGlobalArticleCommandHandler(
            globalArticleRepository: $this->repository,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesGlobalArticleWhenBarcodeIsNew(): void
    {
        ($this->handler)($this->buildCommand(name: 'Leche entera', calories: 64.0));

        $globalArticle = $this->repository->findByBarcode(barcode: '8410000000001');

        $this->assertNotNull($globalArticle);
        $this->assertSame('Leche entera', $globalArticle->name);
        $this->assertSame(64.0, $globalArticle->calories);
        $this->assertSame('openfoodfacts', $globalArticle->source);
    }

    public function testItUpdatesExistingGlobalArticleKeepingSameId(): void
    {
        ($this->handler)($this->buildCommand(name: 'Leche entera', calories: 64.0));
        $created = $this->repository->findByBarcode(barcode: '8410000000001');

        ($this->handler)($this->buildCommand(name: 'Leche entera semidesnatada', calories: 46.0));
        $updated = $this->repository->findByBarcode(barcode: '8410000000001');

        $this->assertSame($created->id, $updated->id);
        $this->assertSame('Leche entera semidesnatada', $updated->name);
        $this->assertSame(46.0, $updated->calories);
    }

    public function testItStoresEveryPricingFieldOnCreation(): void
    {
        ($this->handler)($this->buildCommand(
            name: 'Aceite de oliva',
            calories: 900.0,
            pricing: new GlobalArticlePricing(price: 17.75, bulkPrice: 3.55, referencePrice: 3.55, referenceFormat: 'L', previousPrice: 18.75),
        ));

        $globalArticle = $this->repository->findByBarcode(barcode: '8410000000001');

        $this->assertSame(17.75, $globalArticle->price);
        $this->assertSame(3.55, $globalArticle->bulkPrice);
        $this->assertSame(3.55, $globalArticle->referencePrice);
        $this->assertSame('L', $globalArticle->referenceFormat);
        $this->assertSame(18.75, $globalArticle->previousPrice);
    }

    public function testItKeepsExistingPricingWhenIncomingPricingIsEmpty(): void
    {
        ($this->handler)($this->buildCommand(
            name: 'Aceite de oliva',
            calories: 900.0,
            pricing: new GlobalArticlePricing(price: 17.75, bulkPrice: 3.55, referencePrice: 3.55, referenceFormat: 'L', previousPrice: 18.75),
        ));

        ($this->handler)($this->buildCommand(name: 'Aceite de oliva virgen', calories: 900.0));

        $globalArticle = $this->repository->findByBarcode(barcode: '8410000000001');

        $this->assertSame('Aceite de oliva virgen', $globalArticle->name);
        $this->assertSame(17.75, $globalArticle->price);
        $this->assertSame('L', $globalArticle->referenceFormat);
    }

    public function testItRefreshesOnlyPricingWhenNutritionIsNotProvided(): void
    {
        ($this->handler)($this->buildCommand(name: 'Bífidus con kiwi', calories: 64.0));

        ($this->handler)($this->buildPricingOnlyCommand(
            pricing: new GlobalArticlePricing(price: 1.3, bulkPrice: 2.6, referencePrice: 2.6, referenceFormat: 'kg', previousPrice: null),
        ));

        $globalArticle = $this->repository->findByBarcode(barcode: '8410000000001');

        $this->assertSame(1.3, $globalArticle->price);
        $this->assertSame(2.6, $globalArticle->bulkPrice);
        $this->assertSame('kg', $globalArticle->referenceFormat);
        $this->assertSame(64.0, $globalArticle->calories);
        $this->assertSame(3.1, $globalArticle->protein);
        $this->assertSame(100.0, $globalArticle->referenceAmount);
    }

    public function testItThrowsWhenCreatingWithoutNutrition(): void
    {
        $this->expectException(UpsertGlobalArticleException::class);

        ($this->handler)($this->buildPricingOnlyCommand(
            pricing: new GlobalArticlePricing(price: 1.3),
        ));
    }

    private function buildCommand(string $name, float $calories, ?GlobalArticlePricing $pricing = null): UpsertGlobalArticleCommand
    {
        return $this->buildUpsertCommand(
            name: $name,
            pricing: $pricing ?? GlobalArticlePricing::empty(),
            nutrition: new GlobalArticleNutrition(
                referenceAmount: 100.0,
                calories: $calories,
                protein: 3.1,
                carbs: 4.7,
                sugars: 4.7,
                fat: 3.6,
                saturatedFat: 2.3,
                fiber: 0.0,
                salt: 0.13,
            ),
        );
    }

    private function buildPricingOnlyCommand(GlobalArticlePricing $pricing): UpsertGlobalArticleCommand
    {
        return $this->buildUpsertCommand(name: 'Bífidus con kiwi', pricing: $pricing, nutrition: null);
    }

    private function buildUpsertCommand(
        string $name,
        GlobalArticlePricing $pricing,
        ?GlobalArticleNutrition $nutrition,
    ): UpsertGlobalArticleCommand {
        return new UpsertGlobalArticleCommand(
            barcode: '8410000000001',
            name: $name,
            brand: 'Hacendado',
            categoryName: 'Lácteos',
            imageUrl: null,
            quantity: '1 L',
            stores: 'Mercadona',
            pricing: $pricing,
            source: 'openfoodfacts',
            nutrition: $nutrition,
        );
    }
}
