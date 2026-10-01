<?php

namespace App\Tests\Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Application\Command\ChangeArticleFavoriteCommand;
use Nutrition\Catalog\Article\Application\Command\ChangeArticleFavoriteCommandHandler;
use Nutrition\Catalog\Article\Domain\Event\ArticleFavoriteChanged;
use Nutrition\Catalog\Article\Domain\Exception\ChangeArticleFavoriteException;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Infrastructure\Domain\Model\InMemory\InMemoryArticleRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ChangeArticleFavoriteCommandHandlerTest extends TestCase
{
    private InMemoryArticleRepository $articleRepository;
    private ChangeArticleFavoriteCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->articleRepository = new InMemoryArticleRepository();
        $this->handler = new ChangeArticleFavoriteCommandHandler(
            articleRepository: $this->articleRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $dateTimeGenerator,
        );

        $article = Article::create(
            id: 'article-1',
            name: 'Leche entera 1 L',
            recipeUnit: 'ml',
            baseUnit: 'ml',
            diaryUnit: 'ml',
            storageUnit: 'ml',
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
            equivalences: [],
            nutritionFacts: null,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $dateTimeGenerator,
        );
        $article->pullDomainEvents();

        $this->articleRepository->save(article: $article);
    }

    public function testItMarksTheArticleAsFavorite(): void
    {
        ($this->handler)(new ChangeArticleFavoriteCommand(
            articleId: 'article-1',
            favorite: true,
            updatedByUserId: 'another-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');

        $this->assertTrue($article->favorite);
        $this->assertSame('another-user-id', $article->updatedByUserId);
    }

    public function testItRecordsTheWholeArticleInTheEvent(): void
    {
        ($this->handler)(new ChangeArticleFavoriteCommand(
            articleId: 'article-1',
            favorite: true,
            updatedByUserId: 'another-user-id',
        ));

        $events = $this->articleRepository->findById(id: 'article-1')->pullDomainEvents();

        $this->assertCount(1, $events);
        $this->assertInstanceOf(ArticleFavoriteChanged::class, $events[0]);
        $this->assertTrue($events[0]->favorite);
        $this->assertSame('Leche entera 1 L', $events[0]->name);
        $this->assertSame('Hacendado', $events[0]->brand);
        $this->assertSame(1.15, $events[0]->price);
        $this->assertSame('god-user-id', $events[0]->createdByUserId);
        $this->assertSame('another-user-id', $events[0]->updatedByUserId);
    }

    public function testItUnmarksTheArticleAsFavorite(): void
    {
        ($this->handler)(new ChangeArticleFavoriteCommand(
            articleId: 'article-1',
            favorite: true,
            updatedByUserId: 'god-user-id',
        ));
        ($this->handler)(new ChangeArticleFavoriteCommand(
            articleId: 'article-1',
            favorite: false,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertFalse($this->articleRepository->findById(id: 'article-1')->favorite);
    }

    public function testItRecordsNothingWhenTheFavoriteDoesNotChange(): void
    {
        ($this->handler)(new ChangeArticleFavoriteCommand(
            articleId: 'article-1',
            favorite: false,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame([], $this->articleRepository->findById(id: 'article-1')->pullDomainEvents());
    }

    public function testItFailsWhenTheArticleDoesNotExist(): void
    {
        $this->expectException(ChangeArticleFavoriteException::class);

        ($this->handler)(new ChangeArticleFavoriteCommand(
            articleId: 'missing',
            favorite: true,
            updatedByUserId: 'god-user-id',
        ));
    }
}
