<?php

namespace App\Tests\Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Stock\Application\Command\DecreaseArticleStockCommand;
use Nutrition\Pantry\Stock\Application\Command\DecreaseArticleStockCommandHandler;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Infrastructure\Domain\Model\InMemory\InMemoryArticleStockRepository;
use Nutrition\Pantry\Stock\Infrastructure\Domain\Service\InMemory\InMemoryArticleStockUnitConverter;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DecreaseArticleStockCommandHandlerTest extends TestCase
{
    private InMemoryArticleStockRepository $articleStockRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private DecreaseArticleStockCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->articleStockRepository = new InMemoryArticleStockRepository();
        $this->handler = new DecreaseArticleStockCommandHandler(
            articleStockRepository: $this->articleStockRepository,
            unitConverter: new InMemoryArticleStockUnitConverter(factors: ['article-1' => ['pack' => 500.0]]),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItSubtractsFromTheStockAtHand(): void
    {
        $this->givenStock(quantity: 1000.0);

        ($this->handler)(new DecreaseArticleStockCommand(
            articleId: 'article-1',
            quantity: 240.0,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 760.0,
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->quantity,
        );
    }

    public function testItBottomsOutAtZeroInsteadOfGoingNegative(): void
    {
        $this->givenStock(quantity: 100.0);

        ($this->handler)(new DecreaseArticleStockCommand(
            articleId: 'article-1',
            quantity: 480.0,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 0.0,
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->quantity,
        );
    }

    public function testItSubtractsEveryBatchInTurn(): void
    {
        $this->givenStock(quantity: 1000.0);

        foreach ([120.0, 120.0] as $quantity) {
            ($this->handler)(new DecreaseArticleStockCommand(
                articleId: 'article-1',
                quantity: $quantity,
                updatedByUserId: 'god-user-id',
            ));
        }

        $this->assertSame(
            expected: 760.0,
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->quantity,
        );
    }

    public function testItDoesNothingWhenTheArticleHasNoStockRow(): void
    {
        ($this->handler)(new DecreaseArticleStockCommand(
            articleId: 'article-without-stock',
            quantity: 480.0,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->articleStockRepository->findByArticleId(articleId: 'article-without-stock'));
    }

    public function testItTurnsTheDiaryUnitIntoBaseUnitsBeforeSubtracting(): void
    {
        $this->givenStock(quantity: 1000.0);

        ($this->handler)(new DecreaseArticleStockCommand(
            articleId: 'article-1',
            quantity: 1.0,
            updatedByUserId: 'god-user-id',
            unit: 'pack',
        ));

        $this->assertSame(
            expected: 500.0,
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->quantity,
        );
    }

    public function testItLeavesTheQuantityAloneWhenTheUnitIsUnknown(): void
    {
        $this->givenStock(quantity: 1000.0);

        ($this->handler)(new DecreaseArticleStockCommand(
            articleId: 'article-1',
            quantity: 240.0,
            updatedByUserId: 'god-user-id',
            unit: 'loncha',
        ));

        $this->assertSame(
            expected: 760.0,
            actual: $this->articleStockRepository->findByArticleId(articleId: 'article-1')->quantity,
        );
    }

    private function givenStock(float $quantity): void
    {
        $this->articleStockRepository->save(articleStock: ArticleStock::start(
            id: 'article-stock-1',
            articleId: 'article-1',
            quantity: $quantity,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }
}
