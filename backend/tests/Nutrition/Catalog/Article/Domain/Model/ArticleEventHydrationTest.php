<?php

namespace App\Tests\Nutrition\Catalog\Article\Domain\Model;

use Nutrition\Catalog\Article\Domain\Event\ArticleCreated;
use Nutrition\Catalog\Article\Domain\Event\ArticleDeleted;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticleEquivalence;
use Nutrition\Catalog\NutritionFacts\Domain\Model\NutritionFacts;
use PHPUnit\Framework\TestCase;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ArticleEventHydrationTest extends TestCase
{
    private DateTimeGenerator $dateTimeGenerator;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
    }

    public function testCreatedCarriesEveryColumnOfTheArticle(): void
    {
        $article = $this->article();

        /** @var ArticleCreated $event */
        $event = $article->pullDomainEvents()[0];

        $this->assertInstanceOf(expected: ArticleCreated::class, actual: $event);
        $this->assertSame(expected: 'Leche entera 1 L', actual: $event->name);
        $this->assertSame(expected: 'Hacendado', actual: $event->brand);
        $this->assertSame(expected: 1.15, actual: $event->price);
        $this->assertSame(expected: 'category-1', actual: $event->categoryId);
        $this->assertSame(expected: 'supermarket-1', actual: $event->supermarketId);
        $this->assertSame(expected: 'aisle-1', actual: $event->aisleId);
        $this->assertSame(expected: 'nutrition-facts-1', actual: $event->nutritionFactsId);
        $this->assertSame(expected: '8410000000001', actual: $event->barcode);
        $this->assertSame(expected: 'god-user-id', actual: $event->createdByUserId);
        $this->assertSame(expected: 'god-user-id', actual: $event->updatedByUserId);
        $this->assertSame(expected: $article->createdAt, actual: $event->createdAt);
        $this->assertSame(expected: $article->updatedAt, actual: $event->updatedAt);
    }

    public function testCreatedCarriesEveryEquivalenceWithItsIdentity(): void
    {
        /** @var ArticleCreated $event */
        $event = $this->article()->pullDomainEvents()[0];

        $this->assertCount(expectedCount: 1, haystack: $event->equivalences);
        $this->assertSame(expected: 'equivalence-1', actual: $event->equivalences[0]['id']);
        $this->assertSame(expected: 'article-1', actual: $event->equivalences[0]['articleId']);
        $this->assertSame(expected: 'carton', actual: $event->equivalences[0]['unit']);
        $this->assertSame(expected: 1000.0, actual: $event->equivalences[0]['quantity']);
        $this->assertSame(expected: 1, actual: $event->equivalences[0]['position']);
        $this->assertSame(expected: 'god-user-id', actual: $event->equivalences[0]['createdByUserId']);
        $this->assertArrayHasKey(key: 'createdAt', array: $event->equivalences[0]);
        $this->assertArrayHasKey(key: 'updatedAt', array: $event->equivalences[0]);
    }

    public function testCreatedCarriesTheNutritionFactsOfTheArticle(): void
    {
        /** @var ArticleCreated $event */
        $event = $this->article()->pullDomainEvents()[0];

        $this->assertSame(expected: 'nutrition-facts-1', actual: $event->nutritionFacts['id']);
        $this->assertSame(expected: 100.0, actual: $event->nutritionFacts['referenceAmount']);
        $this->assertSame(expected: 64.0, actual: $event->nutritionFacts['calories']);
        $this->assertSame(expected: 3.1, actual: $event->nutritionFacts['protein']);
        $this->assertSame(expected: 4.8, actual: $event->nutritionFacts['carbs']);
        $this->assertSame(expected: 0.5, actual: $event->nutritionFacts['salt']);
    }

    public function testDeletedCarriesTheWholeArticleSoItCanBeRebuilt(): void
    {
        $article = $this->article();
        $article->pullDomainEvents();

        $article->delete(
            nutritionFacts: $this->nutritionFacts()->snapshot(),
            deletedByUserId: 'another-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        /** @var ArticleDeleted $event */
        $event = $article->pullDomainEvents()[0];

        $this->assertInstanceOf(expected: ArticleDeleted::class, actual: $event);
        $this->assertSame(expected: 'Leche entera 1 L', actual: $event->name);
        $this->assertSame(expected: 'ml', actual: $event->baseUnit);
        $this->assertSame(expected: '8410000000001', actual: $event->barcode);
        $this->assertSame(expected: 'another-user-id', actual: $event->deletedByUserId);
        $this->assertSame(expected: 'god-user-id', actual: $event->createdByUserId);
        $this->assertCount(expectedCount: 1, haystack: $event->equivalences);
        $this->assertSame(expected: 'equivalence-1', actual: $event->equivalences[0]['id']);
        $this->assertSame(expected: 'nutrition-facts-1', actual: $event->nutritionFacts['id']);
    }

    private function article(): Article
    {
        return Article::create(
            id: 'article-1',
            name: 'Leche entera 1 L',
            recipeUnit: 'ml',
            baseUnit: 'ml',
            diaryUnit: 'ml',
            packUnit: 'carton',
            price: 1.15,
            brand: 'Hacendado',
            emoji: '🥛',
            image: 'article/article-1.webp',
            categoryId: 'category-1',
            supermarketId: 'supermarket-1',
            aisleId: 'aisle-1',
            nutritionFactsId: 'nutrition-facts-1',
            barcode: '8410000000001',
            equivalences: [$this->equivalence()],
            nutritionFacts: $this->nutritionFacts()->snapshot(),
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    private function equivalence(): ArticleEquivalence
    {
        $equivalence = ArticleEquivalence::create(
            articleId: 'article-1',
            unit: 'carton',
            quantity: 1000.0,
            position: 1,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $equivalence->id = 'equivalence-1';

        return $equivalence;
    }

    private function nutritionFacts(): NutritionFacts
    {
        $nutritionFacts = NutritionFacts::create(
            referenceAmount: 100.0,
            calories: 64.0,
            protein: 3.1,
            carbs: 4.8,
            sugars: 4.8,
            fat: 3.6,
            saturatedFat: 2.3,
            fiber: 0.0,
            salt: 0.5,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $nutritionFacts->id = 'nutrition-facts-1';

        return $nutritionFacts;
    }
}
