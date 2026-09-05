<?php

namespace App\Tests\Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Stock\Application\Command\ClearArticleStockLocationCommand;
use Nutrition\Pantry\Stock\Application\Command\ClearArticleStockLocationCommandHandler;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Infrastructure\Domain\Model\InMemory\InMemoryArticleStockRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ClearArticleStockLocationCommandHandlerTest extends TestCase
{
    private InMemoryArticleStockRepository $articleStockRepository;
    private ClearArticleStockLocationCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->articleStockRepository = new InMemoryArticleStockRepository();

        foreach ([['article-1', 'location-1'], ['article-2', 'location-1'], ['article-3', 'location-2']] as $index => [$articleId, $locationId]) {
            $this->articleStockRepository->save(articleStock: ArticleStock::start(
                id: 'article-stock-'.($index + 1),
                articleId: $articleId,
                quantity: 100.0,
                createdByUserId: 'god-user-id',
                dateTimeGenerator: $dateTimeGenerator,
                locationId: $locationId,
            ));
        }

        $this->handler = new ClearArticleStockLocationCommandHandler(
            articleStockRepository: $this->articleStockRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItEmptiesTheLocationOfEveryStockRowItHeld(): void
    {
        ($this->handler)(new ClearArticleStockLocationCommand(
            locationId: 'location-1',
            updatedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->locationId);
        $this->assertNull(actual: $this->articleStockRepository->findByArticleId(articleId: 'article-2')->locationId);
    }

    public function testItLeavesTheOtherLocationsAlone(): void
    {
        ($this->handler)(new ClearArticleStockLocationCommand(
            locationId: 'location-1',
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 'location-2',
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-3')->locationId,
        );
    }

    public function testItKeepsTheQuantityUntouched(): void
    {
        ($this->handler)(new ClearArticleStockLocationCommand(
            locationId: 'location-1',
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 100.0,
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->quantity,
        );
    }
}
