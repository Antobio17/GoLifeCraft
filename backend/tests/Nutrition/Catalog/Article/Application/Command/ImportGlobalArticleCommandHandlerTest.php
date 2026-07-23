<?php

namespace App\Tests\Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Application\Command\ArticleNutritionFactsAssembler;
use Nutrition\Catalog\Article\Application\Command\ImportGlobalArticleCommand;
use Nutrition\Catalog\Article\Application\Command\ImportGlobalArticleCommandHandler;
use Nutrition\Catalog\Article\Domain\Exception\ImportGlobalArticleException;
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

    public function testItThrowsWhenGlobalArticleAlreadyImported(): void
    {
        $globalArticle = $this->seedGlobalArticle();
        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: $globalArticle->id, importedByUserId: 'user-1'));

        $this->expectException(ImportGlobalArticleException::class);

        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: $globalArticle->id, importedByUserId: 'user-1'));
    }

    public function testItThrowsWhenGlobalArticleNotFound(): void
    {
        $this->expectException(ImportGlobalArticleException::class);

        ($this->handler)(new ImportGlobalArticleCommand(globalArticleId: 'missing', importedByUserId: 'user-1'));
    }

    private function seedGlobalArticle(): GlobalArticle
    {
        $globalArticle = GlobalArticle::create(
            id: $this->globalArticleRepository->nextId(),
            barcode: '8410000000001',
            name: 'Leche entera',
            brand: 'Hacendado',
            categoryName: 'Lácteos',
            imageUrl: null,
            quantity: '1 L',
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
