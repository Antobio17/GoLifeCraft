<?php

namespace App\Tests\Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Application\Command\ArticleEquivalenceAssembler;
use Nutrition\Catalog\Article\Application\Command\ArticleEquivalenceData;
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
            equivalenceAssembler: new ArticleEquivalenceAssembler(dateTimeGenerator: $this->dateTimeGenerator),
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
            recipeUnit: 'ml',
            baseUnit: 'ml',
            diaryUnit: 'ml',
            packUnit: 'pack',
            price: 1.05,
            brand: 'Central Lechera',
            emoji: '🥛',
            categoryId: 'category-2',
            supermarketId: null,
            aisleId: null,
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
            equivalences: [
                new ArticleEquivalenceData(unit: 'pack', quantity: 1000.0, position: 1),
            ],
            updatedByUserId: 'god-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');
        $this->assertEquals(expected: 'Leche semidesnatada 1 L', actual: $article->name);
        $this->assertEquals(expected: 'ml', actual: $article->baseUnit);
        $this->assertEquals(expected: 'pack', actual: $article->packUnit);
        $this->assertEquals(expected: 1.05, actual: $article->price);
        $this->assertEquals(expected: 'category-2', actual: $article->categoryId);
        $this->assertNull(actual: $article->supermarketId);
        $nutritionFacts = $this->articleRepository->findNutritionFactsById(nutritionFactsId: $article->nutritionFactsId);
        $this->assertEquals(expected: 46.0, actual: $nutritionFacts->calories);
    }

    public function testItReplacesEquivalencesOnUpdate(): void
    {
        $this->givenArticle(id: 'article-1', name: 'Huevos M', equivalences: [
            new ArticleEquivalenceData(unit: 'unit', quantity: 55.0, position: 1),
        ]);

        ($this->handler)(new UpdateArticleCommand(
            articleId: 'article-1',
            name: 'Huevos M',
            recipeUnit: 'unit',
            baseUnit: 'g',
            diaryUnit: 'unit',
            packUnit: null,
            price: null,
            brand: null,
            emoji: '🥚',
            categoryId: null,
            supermarketId: null,
            aisleId: null,
            nutrition: ArticleNutritionData::fromArray(rawNutrition: []),
            equivalences: [
                new ArticleEquivalenceData(unit: 'unit', quantity: 60.0, position: 1),
                new ArticleEquivalenceData(unit: 'pack', quantity: 720.0, position: 2),
            ],
            updatedByUserId: 'god-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');
        $this->assertCount(expectedCount: 2, haystack: $article->equivalences);
        $this->assertEquals(expected: 60.0, actual: $article->equivalences[0]->quantity);
        $this->assertEquals(expected: 'pack', actual: $article->equivalences[1]->unit);
    }

    public function testItThrowsWhenArticleNotFound(): void
    {
        $this->expectException(exception: UpdateArticleException::class);

        ($this->handler)(new UpdateArticleCommand(
            articleId: 'missing',
            name: 'Cualquiera',
            recipeUnit: 'g',
            baseUnit: 'g',
            diaryUnit: 'g',
            packUnit: null,
            price: null,
            brand: null,
            emoji: null,
            categoryId: null,
            supermarketId: null,
            aisleId: null,
            nutrition: ArticleNutritionData::fromArray(rawNutrition: []),
            equivalences: [],
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenThePackUnitIsNotAnEquivalence(): void
    {
        $this->givenArticle(id: 'article-1', name: 'Macarrones');

        $this->expectException(exception: UpdateArticleException::class);

        ($this->handler)(new UpdateArticleCommand(
            articleId: 'article-1',
            name: 'Macarrones',
            recipeUnit: 'g',
            baseUnit: 'g',
            diaryUnit: 'g',
            packUnit: 'pack',
            price: null,
            brand: null,
            emoji: null,
            categoryId: null,
            supermarketId: null,
            aisleId: null,
            nutrition: ArticleNutritionData::fromArray(rawNutrition: []),
            equivalences: [
                new ArticleEquivalenceData(unit: 'serving', quantity: 80.0, position: 1),
            ],
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
            recipeUnit: 'g',
            baseUnit: 'g',
            diaryUnit: 'g',
            packUnit: null,
            price: null,
            brand: null,
            emoji: null,
            categoryId: null,
            supermarketId: null,
            aisleId: null,
            nutrition: ArticleNutritionData::fromArray(rawNutrition: []),
            equivalences: [],
            updatedByUserId: 'god-user-id',
        ));
    }

    /**
     * @param ArticleEquivalenceData[] $equivalences
     */
    private function givenArticle(string $id, string $name, array $equivalences = []): void
    {
        $assembler = new ArticleEquivalenceAssembler(dateTimeGenerator: $this->dateTimeGenerator);

        $article = Article::create(
            id: $id,
            name: $name,
            recipeUnit: 'g',
            baseUnit: 'g',
            diaryUnit: 'g',
            packUnit: null,
            price: 1.15,
            brand: 'Hacendado',
            emoji: '🥛',
            image: null,
            categoryId: null,
            supermarketId: null,
            aisleId: null,
            nutritionFactsId: null,
            barcode: null,
            equivalences: $assembler->assemble(articleId: $id, equivalences: $equivalences, userId: 'god-user-id'),
            nutritionFacts: null,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleRepository->save(article: $article);
    }
}
