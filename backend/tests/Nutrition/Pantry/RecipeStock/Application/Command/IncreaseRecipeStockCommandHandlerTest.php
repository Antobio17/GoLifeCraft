<?php

namespace App\Tests\Nutrition\Pantry\RecipeStock\Application\Command;

use Nutrition\Pantry\RecipeStock\Application\Command\IncreaseRecipeStockCommand;
use Nutrition\Pantry\RecipeStock\Application\Command\IncreaseRecipeStockCommandHandler;
use Nutrition\Pantry\RecipeStock\Domain\Exception\UpdateRecipeStockException;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStock;
use Nutrition\Pantry\RecipeStock\Infrastructure\Domain\Model\InMemory\InMemoryRecipeStockRepository;
use Nutrition\Pantry\RecipeStock\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateRecipeStockNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class IncreaseRecipeStockCommandHandlerTest extends TestCase
{
    private InMemoryRecipeStockRepository $recipeStockRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private IncreaseRecipeStockCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->recipeStockRepository = new InMemoryRecipeStockRepository();
        $this->handler = new IncreaseRecipeStockCommandHandler(
            recipeStockRepository: $this->recipeStockRepository,
            needleDataQuery: new InMemoryUpdateRecipeStockNeedleDataQuery(recipeIds: ['recipe-1']),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItStartsTheStockWhenTheRecipeHasNoneYet(): void
    {
        ($this->handler)(new IncreaseRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: 4.0,
            updatedByUserId: 'god-user-id',
        ));

        $stock = $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1');

        $this->assertNotNull(actual: $stock);
        $this->assertSame(expected: 4.0, actual: $stock->servings);
    }

    public function testItAddsToWhateverIsLeftInsteadOfOverwritingIt(): void
    {
        $this->recipeStockRepository->save(recipeStock: RecipeStock::start(
            id: 'recipe-stock-1',
            recipeId: 'recipe-1',
            servings: 2.0,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));

        ($this->handler)(new IncreaseRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: 6.0,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 8.0,
            actual: $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1')->servings,
        );
    }

    public function testItAccumulatesEveryBatchOfTheSameRecipe(): void
    {
        foreach ([3.0, 3.0, 1.5] as $servings) {
            ($this->handler)(new IncreaseRecipeStockCommand(
                recipeId: 'recipe-1',
                servings: $servings,
                updatedByUserId: 'god-user-id',
            ));
        }

        $this->assertSame(
            expected: 7.5,
            actual: $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1')->servings,
        );
    }

    public function testItThrowsWhenTheRecipeDoesNotExist(): void
    {
        $this->expectException(exception: UpdateRecipeStockException::class);

        ($this->handler)(new IncreaseRecipeStockCommand(
            recipeId: 'missing',
            servings: 4.0,
            updatedByUserId: 'god-user-id',
        ));
    }
}
