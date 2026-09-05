<?php

namespace App\Tests\Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Stock\Application\Command\MoveArticleStockCommand;
use Nutrition\Pantry\Stock\Application\Command\MoveArticleStockCommandHandler;
use Nutrition\Pantry\Stock\Domain\Exception\MoveArticleStockException;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Infrastructure\Domain\Model\InMemory\InMemoryArticleStockRepository;
use Nutrition\Pantry\Stock\Infrastructure\Domain\QueryModel\InMemory\InMemoryMoveArticleStockNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class MoveArticleStockCommandHandlerTest extends TestCase
{
    private InMemoryArticleStockRepository $articleStockRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private MoveArticleStockCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->articleStockRepository = new InMemoryArticleStockRepository();
        $this->handler = new MoveArticleStockCommandHandler(
            articleStockRepository: $this->articleStockRepository,
            needleDataQuery: new InMemoryMoveArticleStockNeedleDataQuery(
                articleIds: ['article-1'],
                locationIds: ['location-1'],
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItMovesTheStockToTheLocation(): void
    {
        $this->givenStock();

        ($this->handler)(new MoveArticleStockCommand(
            articleId: 'article-1',
            locationId: 'location-1',
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 'location-1',
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->locationId,
        );
    }

    public function testItStartsAnEmptyStockRowWhenTheArticleHasNoneYet(): void
    {
        ($this->handler)(new MoveArticleStockCommand(
            articleId: 'article-1',
            locationId: 'location-1',
            updatedByUserId: 'god-user-id',
        ));

        $stock = $this->articleStockRepository->findByArticleId(articleId: 'article-1');

        $this->assertSame(expected: 0.0, actual: $stock->quantity);
        $this->assertSame(expected: 'location-1', actual: $stock->locationId);
    }

    public function testItTakesTheStockOutOfEveryLocation(): void
    {
        $this->givenStock(locationId: 'location-1');

        ($this->handler)(new MoveArticleStockCommand(
            articleId: 'article-1',
            locationId: null,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertNull(
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->locationId,
        );
    }

    public function testItRefusesAnUnknownLocation(): void
    {
        $this->givenStock();

        $this->expectException(exception: MoveArticleStockException::class);

        ($this->handler)(new MoveArticleStockCommand(
            articleId: 'article-1',
            locationId: 'missing-location',
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownArticle(): void
    {
        $this->expectException(exception: MoveArticleStockException::class);

        ($this->handler)(new MoveArticleStockCommand(
            articleId: 'missing-article',
            locationId: 'location-1',
            updatedByUserId: 'god-user-id',
        ));
    }

    private function givenStock(?string $locationId = null): void
    {
        $this->articleStockRepository->save(articleStock: ArticleStock::start(
            id: 'article-stock-1',
            articleId: 'article-1',
            quantity: 1000.0,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
            locationId: $locationId,
        ));
    }
}
