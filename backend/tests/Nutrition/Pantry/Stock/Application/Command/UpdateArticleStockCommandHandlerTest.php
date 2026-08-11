<?php

namespace App\Tests\Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Stock\Application\Command\UpdateArticleStockCommand;
use Nutrition\Pantry\Stock\Application\Command\UpdateArticleStockCommandHandler;
use Nutrition\Pantry\Stock\Domain\Exception\ArticleStockException;
use Nutrition\Pantry\Stock\Domain\Exception\UpdateArticleStockException;
use Nutrition\Pantry\Stock\Infrastructure\Domain\Model\InMemory\InMemoryArticleStockRepository;
use Nutrition\Pantry\Stock\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateArticleStockNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateArticleStockCommandHandlerTest extends TestCase
{
    private InMemoryArticleStockRepository $articleStockRepository;
    private UpdateArticleStockCommandHandler $handler;

    protected function setUp(): void
    {
        $this->articleStockRepository = new InMemoryArticleStockRepository();
        $this->handler = new UpdateArticleStockCommandHandler(
            articleStockRepository: $this->articleStockRepository,
            needleDataQuery: new InMemoryUpdateArticleStockNeedleDataQuery(articleIds: ['article-1']),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItStartsTheStockOfAnArticleWithoutStockYet(): void
    {
        ($this->handler)(new UpdateArticleStockCommand(
            articleId: 'article-1',
            quantity: 1000.0,
            updatedByUserId: 'god-user-id',
        ));

        $stock = $this->articleStockRepository->findByArticleId(articleId: 'article-1');

        $this->assertNotNull(actual: $stock);
        $this->assertSame(expected: 1000.0, actual: $stock->quantity);
    }

    public function testItChangesTheStockKeepingTheSameAggregate(): void
    {
        ($this->handler)(new UpdateArticleStockCommand(
            articleId: 'article-1',
            quantity: 1000.0,
            updatedByUserId: 'god-user-id',
        ));
        $startedId = $this->articleStockRepository->findByArticleId(articleId: 'article-1')->id;

        ($this->handler)(new UpdateArticleStockCommand(
            articleId: 'article-1',
            quantity: 240.0,
            updatedByUserId: 'god-user-id',
        ));

        $stock = $this->articleStockRepository->findByArticleId(articleId: 'article-1');

        $this->assertSame(expected: $startedId, actual: $stock->id);
        $this->assertSame(expected: 240.0, actual: $stock->quantity);
    }

    public function testItEmptiesTheStock(): void
    {
        ($this->handler)(new UpdateArticleStockCommand(
            articleId: 'article-1',
            quantity: 500.0,
            updatedByUserId: 'god-user-id',
        ));

        ($this->handler)(new UpdateArticleStockCommand(
            articleId: 'article-1',
            quantity: 0.0,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 0.0,
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->quantity,
        );
    }

    public function testItThrowsWhenQuantityIsNegative(): void
    {
        $this->expectException(exception: ArticleStockException::class);

        ($this->handler)(new UpdateArticleStockCommand(
            articleId: 'article-1',
            quantity: -1.0,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheArticleDoesNotExist(): void
    {
        $this->expectException(exception: UpdateArticleStockException::class);

        ($this->handler)(new UpdateArticleStockCommand(
            articleId: 'missing',
            quantity: 500.0,
            updatedByUserId: 'god-user-id',
        ));
    }
}
