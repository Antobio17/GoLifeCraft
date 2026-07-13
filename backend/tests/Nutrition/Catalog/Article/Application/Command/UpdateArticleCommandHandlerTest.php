<?php

namespace App\Tests\Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Application\Command\ArticleNutritionData;
use Nutrition\Catalog\Article\Application\Command\ArticleNutritionFactsAssembler;
use Nutrition\Catalog\Article\Application\Command\UpdateArticleCommand;
use Nutrition\Catalog\Article\Application\Command\UpdateArticleCommandHandler;
use Nutrition\Catalog\Article\Domain\Exception\UpdateArticleException;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Infrastructure\Domain\Model\InMemory\InMemoryArticleRepository;
use Nutrition\Catalog\Article\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateArticleNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateArticleCommandHandlerTest extends TestCase
{
    private InMemoryArticleRepository $articleRepository;
    private InMemoryUpdateArticleNeedleDataQuery $needleDataQuery;
    private DateTimeGenerator $dateTimeGenerator;
    private UpdateArticleCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->articleRepository = new InMemoryArticleRepository();
        $this->needleDataQuery = new InMemoryUpdateArticleNeedleDataQuery();
        $this->handler = new UpdateArticleCommandHandler(
            articleRepository: $this->articleRepository,
            needleDataQuery: $this->needleDataQuery,
            nutritionFactsAssembler: new ArticleNutritionFactsAssembler(dateTimeGenerator: $this->dateTimeGenerator),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItUpdatesAnExistingArticle(): void
    {
        $this->givenArticle(id: 'article-1', name: 'Leche entera 1 L');

        ($this->handler)(new UpdateArticleCommand(
            articleId: 'article-1',
            name: 'Leche semidesnatada 1 L',
            recipeUnit: 'gram',
            price: 1.05,
            brand: 'Central Lechera',
            emoji: '🥛',
            categoryId: 'category-2',
            supermarketId: null,
            nutrition: new ArticleNutritionData(
                referenceAmount: 100.0,
                calories: 46.0,
                protein: 3.1,
                carbs: 4.8,
                sugars: 4.8,
                fat: 1.6,
                saturatedFat: 1.0,
                fiber: null,
                salt: 0.1,
            ),
            updatedByUserId: 'god-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');
        $this->assertEquals(expected: 'Leche semidesnatada 1 L', actual: $article->name);
        $this->assertEquals(expected: 1.05, actual: $article->price);
        $this->assertEquals(expected: 'category-2', actual: $article->categoryId);
        $this->assertNull(actual: $article->supermarketId);
        $nutritionFacts = $this->articleRepository->findNutritionFactsById(nutritionFactsId: $article->nutritionFactsId);
        $this->assertEquals(expected: 46.0, actual: $nutritionFacts->calories);
    }

    public function testItThrowsWhenArticleNotFound(): void
    {
        $this->expectException(exception: UpdateArticleException::class);

        ($this->handler)(new UpdateArticleCommand(
            articleId: 'missing',
            name: 'Cualquiera',
            recipeUnit: 'gram',
            price: null,
            brand: null,
            emoji: null,
            categoryId: null,
            supermarketId: null,
            nutrition: ArticleNutritionData::fromArray(rawNutrition: []),
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenNameAlreadyExists(): void
    {
        $this->givenArticle(id: 'article-1', name: 'Leche entera 1 L');
        $this->needleDataQuery->addExistingName(name: 'Pan de molde');

        $this->expectException(exception: UpdateArticleException::class);

        ($this->handler)(new UpdateArticleCommand(
            articleId: 'article-1',
            name: 'Pan de molde',
            recipeUnit: 'gram',
            price: null,
            brand: null,
            emoji: null,
            categoryId: null,
            supermarketId: null,
            nutrition: ArticleNutritionData::fromArray(rawNutrition: []),
            updatedByUserId: 'god-user-id',
        ));
    }

    private function givenArticle(string $id, string $name): void
    {
        $article = Article::create(
            id: $id,
            name: $name,
            recipeUnit: 'gram',
            price: 1.15,
            brand: 'Hacendado',
            emoji: '🥛',
            categoryId: null,
            supermarketId: null,
            nutritionFactsId: null,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleRepository->save(article: $article);
    }
}
