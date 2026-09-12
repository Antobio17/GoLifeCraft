<?php

namespace App\Tests\Nutrition\Pantry\RecipeStock\Application\Command;

use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Model\InMemory\InMemoryStockMovementRepository;
use Nutrition\Pantry\Movement\Infrastructure\Domain\Service\InMemory\InMemoryStockBalanceCalculator;
use Nutrition\Pantry\RecipeStock\Application\Command\RecalculateRecipeStockCommand;
use Nutrition\Pantry\RecipeStock\Application\Command\RecalculateRecipeStockCommandHandler;
use Nutrition\Pantry\RecipeStock\Infrastructure\Domain\Model\InMemory\InMemoryRecipeStockRepository;
use Nutrition\Pantry\RecipeStock\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateRecipeStockNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class RecalculateRecipeStockCommandHandlerTest extends TestCase
{
    private InMemoryRecipeStockRepository $recipeStockRepository;
    private InMemoryStockMovementRepository $stockMovementRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private RecalculateRecipeStockCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->recipeStockRepository = new InMemoryRecipeStockRepository();
        $this->stockMovementRepository = new InMemoryStockMovementRepository();
        $this->handler = new RecalculateRecipeStockCommandHandler(
            recipeStockRepository: $this->recipeStockRepository,
            needleDataQuery: new InMemoryUpdateRecipeStockNeedleDataQuery(recipeIds: ['recipe-1']),
            balanceCalculator: new InMemoryStockBalanceCalculator(
                stockMovementRepository: $this->stockMovementRepository,
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItProjectsWhatWasCookedMinusWhatWasEaten(): void
    {
        $this->givenMovement(effectiveAt: '2026-02-01 12:00:00', quantity: 6.0, sourceKind: StockMovement::SOURCE_PRODUCTION_OUTPUT, sourceId: 'production-item-1');
        $this->givenMovement(effectiveAt: '2026-02-02 12:00:00', quantity: -2.0, sourceKind: StockMovement::SOURCE_DIARY_ENTRY, sourceId: 'diary-entry-1');

        ($this->handler)(new RecalculateRecipeStockCommand(recipeId: 'recipe-1', updatedByUserId: 'god-user-id'));

        $this->assertSame(
            expected: 4.0,
            actual: $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1')->servings,
        );
    }

    public function testItIgnoresARecipeThatNoLongerExists(): void
    {
        ($this->handler)(new RecalculateRecipeStockCommand(recipeId: 'missing-recipe', updatedByUserId: 'god-user-id'));

        $this->assertNull(actual: $this->recipeStockRepository->findByRecipeId(recipeId: 'missing-recipe'));
    }

    private function givenMovement(string $effectiveAt, float $quantity, string $sourceKind, string $sourceId): void
    {
        $this->stockMovementRepository->save(stockMovement: StockMovement::register(
            id: $this->stockMovementRepository->nextId(),
            kind: StockMovement::KIND_RECIPE,
            refId: 'recipe-1',
            type: StockMovement::TYPE_DELTA,
            effectiveAt: new \DateTime(datetime: $effectiveAt),
            quantity: $quantity,
            originalQuantity: $quantity,
            originalUnit: null,
            sourceKind: $sourceKind,
            sourceId: $sourceId,
            registeredByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }
}
