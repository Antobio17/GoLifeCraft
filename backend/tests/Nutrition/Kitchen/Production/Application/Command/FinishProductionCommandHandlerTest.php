<?php

namespace App\Tests\Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Application\Command\FinishProductionCommand;
use Nutrition\Kitchen\Production\Application\Command\FinishProductionCommandHandler;
use Nutrition\Kitchen\Production\Domain\Event\ProductionCooked;
use Nutrition\Kitchen\Production\Domain\Exception\FinishProductionException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Infrastructure\Domain\Model\InMemory\InMemoryProductionRepository;
use Nutrition\Kitchen\Production\Infrastructure\Domain\QueryModel\InMemory\InMemoryFinishProductionNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class FinishProductionCommandHandlerTest extends TestCase
{
    private InMemoryProductionRepository $productionRepository;
    private InMemoryFinishProductionNeedleDataQuery $needleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private DateTimeGenerator $dateTimeGenerator;
    private FinishProductionCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->productionRepository = new InMemoryProductionRepository();
        $this->needleDataQuery = new InMemoryFinishProductionNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new FinishProductionCommandHandler(
            productionRepository: $this->productionRepository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: Production::start(
            id: 'production-1',
            recipeId: 'recipe-1',
            cookDate: '2026-08-26',
            servingsPlanned: 2.0,
            nameSnapshot: 'Lentejas con chorizo',
            emojiSnapshot: '🍲',
            startedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
        $this->domainEventCollectorService->reset();
    }

    public function testItFinishesTheProductionWithTheServingsActuallyCooked(): void
    {
        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            servingsCooked: 6.0,
            finishedByUserId: 'god-user-id',
        ));

        $production = $this->productionRepository->findById(id: 'production-1');

        $this->assertTrue(condition: $production->isDone());
        $this->assertSame(expected: 6.0, actual: $production->servingsCooked);
    }

    public function testItRecordsTheConsumedArticlesScaledToWhatWasCooked(): void
    {
        $this->needleDataQuery->addIngredient(recipeId: 'recipe-1', articleId: 'article-lentils', quantityPerServing: 120.0);
        $this->needleDataQuery->addIngredient(recipeId: 'recipe-1', articleId: 'article-chorizo', quantityPerServing: 30.0);

        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            servingsCooked: 4.0,
            finishedByUserId: 'god-user-id',
        ));

        $event = $this->cookedEvent();

        $this->assertSame(expected: 4.0, actual: $event->servingsCooked);
        $this->assertSame(expected: [
            ['articleId' => 'article-lentils', 'quantity' => 480.0, 'unit' => 'g'],
            ['articleId' => 'article-chorizo', 'quantity' => 120.0, 'unit' => 'g'],
        ], actual: $event->consumedArticles);
    }

    public function testItConvertsPackUnitsIntoTheArticleBaseUnit(): void
    {
        $this->needleDataQuery->addIngredient(
            recipeId: 'recipe-1',
            articleId: 'article-minced-meat',
            quantityPerServing: 0.5,
            unit: 'pack',
            factor: 500.0,
        );

        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            servingsCooked: 4.0,
            finishedByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: [
            ['articleId' => 'article-minced-meat', 'quantity' => 1000.0, 'unit' => 'g'],
        ], actual: $this->cookedEvent()->consumedArticles);
    }

    public function testItMergesAnArticleUsedTwiceByNestedRecipes(): void
    {
        $this->needleDataQuery->addIngredient(recipeId: 'recipe-1', articleId: 'article-oil', quantityPerServing: 10.0);
        $this->needleDataQuery->addIngredient(recipeId: 'recipe-1', articleId: 'article-oil', quantityPerServing: 5.0);

        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            servingsCooked: 2.0,
            finishedByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: [
            ['articleId' => 'article-oil', 'quantity' => 30.0, 'unit' => 'g'],
        ], actual: $this->cookedEvent()->consumedArticles);
    }

    public function testItFinishesARecipeWithoutIngredients(): void
    {
        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            servingsCooked: 2.0,
            finishedByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: [], actual: $this->cookedEvent()->consumedArticles);
    }

    public function testItThrowsWhenTheProductionIsAlreadyFinished(): void
    {
        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            servingsCooked: 4.0,
            finishedByUserId: 'god-user-id',
        ));

        $this->expectException(exception: FinishProductionException::class);

        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            servingsCooked: 4.0,
            finishedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenCookedServingsAreNotPositive(): void
    {
        $this->expectException(exception: FinishProductionException::class);

        ($this->handler)(new FinishProductionCommand(
            productionId: 'production-1',
            servingsCooked: 0.0,
            finishedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheProductionDoesNotExist(): void
    {
        $this->expectException(exception: FinishProductionException::class);

        ($this->handler)(new FinishProductionCommand(
            productionId: 'missing',
            servingsCooked: 4.0,
            finishedByUserId: 'god-user-id',
        ));
    }

    private function cookedEvent(): ProductionCooked
    {
        foreach ($this->domainEventCollectorService->pullEvents() as $event) {
            if ($event instanceof ProductionCooked) {
                return $event;
            }
        }

        $this->fail(message: 'No ProductionCooked event was recorded.');
    }
}
