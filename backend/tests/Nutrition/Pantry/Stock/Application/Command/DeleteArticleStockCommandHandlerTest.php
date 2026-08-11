<?php

namespace App\Tests\Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Stock\Application\Command\DeleteArticleStockCommand;
use Nutrition\Pantry\Stock\Application\Command\DeleteArticleStockCommandHandler;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Infrastructure\Domain\Model\InMemory\InMemoryArticleStockRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteArticleStockCommandHandlerTest extends TestCase
{
    private InMemoryArticleStockRepository $articleStockRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private DeleteArticleStockCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->articleStockRepository = new InMemoryArticleStockRepository();
        $this->handler = new DeleteArticleStockCommandHandler(
            articleStockRepository: $this->articleStockRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItDeletesTheStockOfTheArticle(): void
    {
        $this->articleStockRepository->save(articleStock: ArticleStock::start(
            id: 'article-stock-1',
            articleId: 'article-1',
            quantity: 500.0,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));

        ($this->handler)(new DeleteArticleStockCommand(
            articleId: 'article-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1'));
    }

    public function testItDoesNothingWhenTheArticleHasNoStock(): void
    {
        ($this->handler)(new DeleteArticleStockCommand(
            articleId: 'article-without-stock',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->articleStockRepository->findByArticleId(articleId: 'article-without-stock'));
    }
}
