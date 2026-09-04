<?php

namespace App\Tests\Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Application\Command\AssignArticleImageCommand;
use Nutrition\Catalog\Article\Application\Command\AssignArticleImageCommandHandler;
use Nutrition\Catalog\Article\Domain\Exception\AssignArticleImageException;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticleEquivalence;
use Nutrition\Catalog\Article\Infrastructure\Domain\Model\InMemory\InMemoryArticleRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Fake\FakeImageStoreService;

final class AssignArticleImageCommandHandlerTest extends TestCase
{
    private InMemoryArticleRepository $articleRepository;
    private FakeImageStoreService $imageStorageService;
    private AssignArticleImageCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->articleRepository = new InMemoryArticleRepository();
        $this->imageStorageService = new FakeImageStoreService();
        $this->handler = new AssignArticleImageCommandHandler(
            articleRepository: $this->articleRepository,
            imageStorageService: $this->imageStorageService,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->articleRepository->save(article: Article::create(
            id: 'article-1',
            name: 'Leche entera 1 L',
            recipeUnit: 'ml',
            baseUnit: 'ml',
            diaryUnit: 'ml',
            packUnit: null,
            price: null,
            brand: null,
            emoji: '🥛',
            image: null,
            categoryId: null,
            supermarketId: null,
            aisleId: null,
            nutritionFactsId: null,
            barcode: null,
            equivalences: [
                ArticleEquivalence::create(
                    articleId: 'article-1',
                    unit: 'carton',
                    quantity: 1000.0,
                    position: 1,
                    createdByUserId: 'god-user-id',
                    dateTimeGenerator: $dateTimeGenerator,
                ),
            ],
            nutritionFacts: null,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $dateTimeGenerator,
        ));
    }

    public function testItStoresTheImageUnderTheArticle(): void
    {
        ($this->handler)(new AssignArticleImageCommand(
            articleId: 'article-1',
            imagePath: '/tmp/upload_1.jpg',
            updatedByUserId: 'god-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');

        $this->assertSame('upload_1.jpg', $article->image);
        $this->assertSame(
            ['aggregate' => 'article', 'aggregateId' => 'article-1', 'imagePath' => '/tmp/upload_1.jpg'],
            $this->imageStorageService->storedImages[0],
        );
    }

    public function testItDropsTheStoredFileWhenTheImageIsReplaced(): void
    {
        ($this->handler)(new AssignArticleImageCommand(
            articleId: 'article-1',
            imagePath: '/tmp/upload_1.jpg',
            updatedByUserId: 'god-user-id',
        ));
        ($this->handler)(new AssignArticleImageCommand(
            articleId: 'article-1',
            imagePath: '/tmp/upload_2.jpg',
            updatedByUserId: 'god-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');

        $this->assertSame('upload_2.jpg', $article->image);
        $this->assertSame(
            ['aggregate' => 'article', 'aggregateId' => 'article-1', 'image' => 'upload_1.jpg'],
            $this->imageStorageService->deletedImages[0],
        );
    }

    public function testItRemovesTheImageWhenNoFileIsSent(): void
    {
        ($this->handler)(new AssignArticleImageCommand(
            articleId: 'article-1',
            imagePath: '/tmp/upload_1.jpg',
            updatedByUserId: 'god-user-id',
        ));
        ($this->handler)(new AssignArticleImageCommand(
            articleId: 'article-1',
            imagePath: null,
            updatedByUserId: 'god-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');

        $this->assertNull($article->image);
        $this->assertCount(1, $this->imageStorageService->storedImages);
    }

    public function testItKeepsTheEquivalencesWhenTheImageIsStored(): void
    {
        ($this->handler)(new AssignArticleImageCommand(
            articleId: 'article-1',
            imagePath: '/tmp/upload_1.jpg',
            updatedByUserId: 'god-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');

        $this->assertCount(1, $article->equivalences);
        $this->assertSame('carton', $article->equivalences[0]->unit);
        $this->assertSame(1000.0, $article->equivalences[0]->quantity);
    }

    public function testItKeepsTheEquivalencesWhenTheImageIsRemoved(): void
    {
        ($this->handler)(new AssignArticleImageCommand(
            articleId: 'article-1',
            imagePath: '/tmp/upload_1.jpg',
            updatedByUserId: 'god-user-id',
        ));
        ($this->handler)(new AssignArticleImageCommand(
            articleId: 'article-1',
            imagePath: null,
            updatedByUserId: 'god-user-id',
        ));

        $article = $this->articleRepository->findById(id: 'article-1');

        $this->assertNull($article->image);
        $this->assertCount(1, $article->equivalences);
        $this->assertSame('carton', $article->equivalences[0]->unit);
    }

    public function testItThrowsWhenTheArticleDoesNotExist(): void
    {
        $this->expectException(AssignArticleImageException::class);

        ($this->handler)(new AssignArticleImageCommand(
            articleId: 'article-404',
            imagePath: '/tmp/upload_1.jpg',
            updatedByUserId: 'god-user-id',
        ));
    }
}
