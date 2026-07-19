<?php

namespace App\Tests\Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Application\Command\DeleteArticleCommand;
use Nutrition\Catalog\Article\Application\Command\DeleteArticleCommandHandler;
use Nutrition\Catalog\Article\Domain\Exception\DeleteArticleException;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Infrastructure\Domain\Model\InMemory\InMemoryArticleRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteArticleCommandHandlerTest extends TestCase
{
    private InMemoryArticleRepository $articleRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private DeleteArticleCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->articleRepository = new InMemoryArticleRepository();
        $this->handler = new DeleteArticleCommandHandler(
            articleRepository: $this->articleRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItDeletesAnExistingArticle(): void
    {
        $article = Article::create(
            id: 'article-1',
            name: 'Leche entera 1 L',
            recipeUnit: 'gram',
            servingSize: null,
            price: null,
            brand: null,
            emoji: null,
            categoryId: null,
            supermarketId: null,
            nutritionFactsId: null,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->articleRepository->save(article: $article);

        ($this->handler)(new DeleteArticleCommand(
            articleId: 'article-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->articleRepository->findById(id: 'article-1'));
    }

    public function testItThrowsWhenArticleNotFound(): void
    {
        $this->expectException(exception: DeleteArticleException::class);

        ($this->handler)(new DeleteArticleCommand(
            articleId: 'missing',
            deletedByUserId: 'god-user-id',
        ));
    }
}
