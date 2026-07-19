<?php

namespace App\Tests\Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Application\Command\ArticleNutritionData;
use Nutrition\Catalog\Article\Application\Command\ArticleNutritionFactsAssembler;
use Nutrition\Catalog\Article\Application\Command\CreateArticleCommand;
use Nutrition\Catalog\Article\Application\Command\CreateArticleCommandHandler;
use Nutrition\Catalog\Article\Domain\Exception\CreateArticleException;
use Nutrition\Catalog\Article\Infrastructure\Domain\Model\InMemory\InMemoryArticleRepository;
use Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateArticleNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateArticleCommandHandlerTest extends TestCase
{
    private InMemoryArticleRepository $articleRepository;
    private InMemoryCreateArticleNeedleDataQuery $needleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private CreateArticleCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->articleRepository = new InMemoryArticleRepository();
        $this->needleDataQuery = new InMemoryCreateArticleNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new CreateArticleCommandHandler(
            articleRepository: $this->articleRepository,
            needleDataQuery: $this->needleDataQuery,
            nutritionFactsAssembler: new ArticleNutritionFactsAssembler(dateTimeGenerator: $dateTimeGenerator),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItCreatesAnArticleWithNutritionAndRelations(): void
    {
        ($this->handler)(new CreateArticleCommand(
            name: 'Leche entera 1 L',
            recipeUnit: 'gram',
            servingSize: 30.0,
            price: 1.15,
            brand: 'Hacendado',
            emoji: '🥛',
            categoryId: 'category-1',
            supermarketId: 'supermarket-1',
            nutrition: new ArticleNutritionData(
                referenceAmount: 100.0,
                calories: 64.0,
                protein: 3.1,
                carbs: 4.7,
                sugars: 4.7,
                fat: 3.6,
                saturatedFat: 2.3,
                fiber: null,
                salt: 0.1,
            ),
            createdByUserId: 'god-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');
        $this->assertNotNull(actual: $article);
        $this->assertEquals(expected: 'Leche entera 1 L', actual: $article->name);
        $this->assertEquals(expected: 30.0, actual: $article->servingSize);
        $this->assertEquals(expected: 1.15, actual: $article->price);
        $this->assertEquals(expected: '🥛', actual: $article->emoji);
        $this->assertEquals(expected: 'category-1', actual: $article->categoryId);
        $this->assertEquals(expected: 'supermarket-1', actual: $article->supermarketId);
        $this->assertNotNull(actual: $article->nutritionFactsId);
        $nutritionFacts = $this->articleRepository->findNutritionFactsById(nutritionFactsId: $article->nutritionFactsId);
        $this->assertNotNull(actual: $nutritionFacts);
        $this->assertEquals(expected: 64.0, actual: $nutritionFacts->calories);
        $this->assertEquals(expected: 100.0, actual: $nutritionFacts->referenceAmount);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItCreatesAnArticleWithoutRelations(): void
    {
        ($this->handler)(new CreateArticleCommand(
            name: 'Producto suelto',
            recipeUnit: 'gram',
            servingSize: null,
            price: null,
            brand: null,
            emoji: null,
            categoryId: null,
            supermarketId: null,
            nutrition: ArticleNutritionData::fromArray(rawNutrition: []),
            createdByUserId: 'god-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');
        $this->assertNotNull(actual: $article);
        $this->assertNull(actual: $article->categoryId);
        $this->assertNull(actual: $article->supermarketId);
        $this->assertNotNull(actual: $article->nutritionFactsId);
    }

    public function testItThrowsExceptionWhenArticleNameAlreadyExists(): void
    {
        $this->needleDataQuery->addExistingName(name: 'Leche entera 1 L');

        $this->expectException(exception: CreateArticleException::class);

        ($this->handler)(new CreateArticleCommand(
            name: 'Leche entera 1 L',
            recipeUnit: 'gram',
            servingSize: null,
            price: null,
            brand: null,
            emoji: null,
            categoryId: null,
            supermarketId: null,
            nutrition: ArticleNutritionData::fromArray(rawNutrition: []),
            createdByUserId: 'god-user-id',
        ));
    }
}
