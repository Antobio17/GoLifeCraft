<?php

namespace App\Tests\Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Application\Command\ArticleEquivalenceAssembler;
use Nutrition\Catalog\Article\Application\Command\ArticleNutritionFactsAssembler;
use Nutrition\Catalog\Article\Application\Command\ImportGlobalArticleCommand;
use Nutrition\Catalog\Article\Application\Command\ImportGlobalArticleCommandHandler;
use Nutrition\Catalog\Article\Domain\Exception\ImportGlobalArticleException;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticleUnit;
use Nutrition\Catalog\Article\Infrastructure\Domain\Model\InMemory\InMemoryArticleRepository;
use Nutrition\Catalog\Category\Infrastructure\Domain\Model\InMemory\InMemoryCategoryRepository;
use Nutrition\Catalog\Supermarket\Infrastructure\Domain\Model\InMemory\InMemorySupermarketRepository;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticle;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleNutrition;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticlePricing;
use Nutrition\GlobalCatalog\Article\Infrastructure\Domain\Model\InMemory\InMemoryGlobalArticleRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ImportGlobalArticleCommandHandlerTest extends TestCase
{
    private InMemoryGlobalArticleRepository $globalArticleRepository;
    private InMemoryArticleRepository $articleRepository;
    private InMemoryCategoryRepository $categoryRepository;
    private InMemorySupermarketRepository $supermarketRepository;
    private ImportGlobalArticleCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->globalArticleRepository = new InMemoryGlobalArticleRepository();
        $this->articleRepository = new InMemoryArticleRepository();
        $this->categoryRepository = new InMemoryCategoryRepository();
        $this->supermarketRepository = new InMemorySupermarketRepository();
        $this->handler = new ImportGlobalArticleCommandHandler(
            globalArticleRepository: $this->globalArticleRepository,
            articleRepository: $this->articleRepository,
            categoryRepository: $this->categoryRepository,
            supermarketRepository: $this->supermarketRepository,
            nutritionFactsAssembler: new ArticleNutritionFactsAssembler(dateTimeGenerator: $dateTimeGenerator),
            equivalenceAssembler: new ArticleEquivalenceAssembler(dateTimeGenerator: $dateTimeGenerator),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItImportsGlobalArticleIntoTenantCatalog(): void
    {
        $globalArticle = $this->seedGlobalArticle();

        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: $globalArticle->id, importedByUserId: 'user-1'));

        $article = $this->articleRepository->findByBarcode(barcode: '8410000000001');

        $this->assertNotNull($article);
        $this->assertSame('Leche entera', $article->name);
        $this->assertSame('Hacendado', $article->brand);
        $this->assertSame(1.25, $article->price);
        $this->assertNotNull($article->categoryId);
        $this->assertNotNull($article->supermarketId);
        $this->assertNotNull($article->nutritionFactsId);
        $this->assertNotNull($this->categoryRepository->findByName(name: 'Lácteos'));
        $this->assertNotNull($this->supermarketRepository->findByName(name: 'Mercadona'));
    }

    public function testItTakesTheUnitsFromTheGlobalArticleQuantity(): void
    {
        $globalArticle = $this->seedGlobalArticle();

        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: $globalArticle->id, importedByUserId: 'user-1'));

        $article = $this->articleRepository->findByBarcode(barcode: '8410000000001');

        $this->assertSame(Article::BASE_UNIT_MILLILITER, $article->baseUnit);
        $this->assertSame(Article::BASE_UNIT_MILLILITER, $article->recipeUnit);
        $this->assertSame(Article::BASE_UNIT_MILLILITER, $article->diaryUnit);
        $this->assertSame(ArticleUnit::PACK->value, $article->packUnit);
        $this->assertCount(1, $article->equivalences);
        $this->assertSame(ArticleUnit::PACK->value, $article->equivalences[0]->unit);
        $this->assertSame(1000.0, $article->equivalences[0]->quantity);
    }

    public function testItSplitsAMultipackQuantityIntoAUnitEquivalence(): void
    {
        $globalArticle = $this->seedGlobalArticle(quantity: '4 x 125 g', barcode: '8410000000002');

        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: $globalArticle->id, importedByUserId: 'user-1'));

        $article = $this->articleRepository->findByBarcode(barcode: '8410000000002');

        $this->assertSame(Article::BASE_UNIT_GRAM, $article->baseUnit);
        $this->assertSame(ArticleUnit::UNIT->value, $article->diaryUnit);
        $this->assertSame(ArticleUnit::PACK->value, $article->packUnit);
        $this->assertCount(2, $article->equivalences);
        $this->assertSame(500.0, $article->equivalences[0]->quantity);
        $this->assertSame(ArticleUnit::UNIT->value, $article->equivalences[1]->unit);
        $this->assertSame(125.0, $article->equivalences[1]->quantity);
    }

    public function testItFallsBackToGramsWhenTheQuantityIsNotMeasurable(): void
    {
        $globalArticle = $this->seedGlobalArticle(quantity: '6 ud', barcode: '8410000000003');

        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: $globalArticle->id, importedByUserId: 'user-1'));

        $article = $this->articleRepository->findByBarcode(barcode: '8410000000003');

        $this->assertSame(Article::BASE_UNIT_GRAM, $article->baseUnit);
        $this->assertSame(Article::BASE_UNIT_GRAM, $article->diaryUnit);
        $this->assertNull($article->packUnit);
        $this->assertSame([], $article->equivalences);
    }

    public function testItRefreshesTheArticleWhenTheGlobalArticleIsImportedAgain(): void
    {
        $globalArticle = $this->seedGlobalArticle(quantity: '6 ud');
        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: $globalArticle->id, importedByUserId: 'user-1'));

        $imported = $this->articleRepository->findByBarcode(barcode: '8410000000001');
        $imported->name = 'Leche de la mañana';
        $imported->emoji = '🥛';
        $this->articleRepository->save(article: $imported);

        $this->repriceGlobalArticle(globalArticle: $globalArticle, quantity: '6 x 200 ml', price: 1.45);

        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: $globalArticle->id, importedByUserId: 'user-2'));

        $article = $this->articleRepository->findByBarcode(barcode: '8410000000001');

        $this->assertSame($imported->id, $article->id);
        $this->assertSame(Article::BASE_UNIT_MILLILITER, $article->baseUnit);
        $this->assertSame(ArticleUnit::UNIT->value, $article->diaryUnit);
        $this->assertSame(ArticleUnit::PACK->value, $article->packUnit);
        $this->assertCount(2, $article->equivalences);
        $this->assertSame(1200.0, $article->equivalences[0]->quantity);
        $this->assertSame(200.0, $article->equivalences[1]->quantity);
        $this->assertSame(1.45, $article->price);
        $this->assertSame('Leche de la mañana', $article->name);
        $this->assertSame('🥛', $article->emoji);
    }

    public function testItKeepsASingleNutritionFactsWhenReimporting(): void
    {
        $globalArticle = $this->seedGlobalArticle();
        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: $globalArticle->id, importedByUserId: 'user-1'));

        $nutritionFactsId = $this->articleRepository->findByBarcode(barcode: '8410000000001')->nutritionFactsId;

        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: $globalArticle->id, importedByUserId: 'user-1'));

        $article = $this->articleRepository->findByBarcode(barcode: '8410000000001');

        $this->assertSame($nutritionFactsId, $article->nutritionFactsId);
        $this->assertSame(64.0, $this->articleRepository->findNutritionFactsById(nutritionFactsId: $nutritionFactsId)->calories);
    }

    public function testItThrowsWhenGlobalArticleNotFound(): void
    {
        $this->expectException(ImportGlobalArticleException::class);

        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: 'missing', importedByUserId: 'user-1'));
    }

    private function repriceGlobalArticle(GlobalArticle $globalArticle, string $quantity, float $price): void
    {
        $globalArticle->apply(
            name: $globalArticle->name,
            brand: $globalArticle->brand,
            categoryName: $globalArticle->categoryName,
            imageUrl: $globalArticle->imageUrl,
            quantity: $quantity,
            stores: $globalArticle->stores,
            pricing: new GlobalArticlePricing(price: $price, bulkPrice: $price, referencePrice: $price, referenceFormat: 'L', previousPrice: $globalArticle->price),
            nutrition: $globalArticle->nutrition(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->globalArticleRepository->save(globalArticle: $globalArticle);
    }

    private function seedGlobalArticle(string $quantity = '1 L', string $barcode = '8410000000001'): GlobalArticle
    {
        $globalArticle = GlobalArticle::create(
            id: $this->globalArticleRepository->nextId(),
            barcode: $barcode,
            name: 'Leche entera',
            brand: 'Hacendado',
            categoryName: 'Lácteos',
            imageUrl: null,
            quantity: $quantity,
            stores: 'Mercadona',
            pricing: new GlobalArticlePricing(price: 1.25, bulkPrice: 1.25, referencePrice: 1.25, referenceFormat: 'L', previousPrice: 1.15),
            source: 'openfoodfacts',
            nutrition: new GlobalArticleNutrition(
                referenceAmount: 100.0,
                calories: 64.0,
                protein: 3.1,
                carbs: 4.7,
                sugars: 4.7,
                fat: 3.6,
                saturatedFat: 2.3,
                fiber: 0.0,
                salt: 0.13,
            ),
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->globalArticleRepository->save(globalArticle: $globalArticle);

        return $globalArticle;
    }
}
