<?php

namespace App\Tests\Nutrition\Pantry\RecipeStock\Application\Command;

use Nutrition\Pantry\RecipeStock\Application\Command\DecreaseRecipeStockCommand;
use Nutrition\Pantry\RecipeStock\Application\Command\DecreaseRecipeStockCommandHandler;
use Nutrition\Pantry\RecipeStock\Domain\Exception\UpdateRecipeStockException;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStock;
use Nutrition\Pantry\RecipeStock\Infrastructure\Domain\Model\InMemory\InMemoryRecipeStockRepository;
use Nutrition\Pantry\RecipeStock\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateRecipeStockNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DecreaseRecipeStockCommandHandlerTest extends TestCase
{
    private InMemoryRecipeStockRepository $recipeStockRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private DecreaseRecipeStockCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->recipeStockRepository = new InMemoryRecipeStockRepository();
        $this->handler = new DecreaseRecipeStockCommandHandler(
            recipeStockRepository: $this->recipeStockRepository,
            needleDataQuery: new InMemoryUpdateRecipeStockNeedleDataQuery(recipeIds: ['recipe-1']),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItTakesTheServingsOutOfWhatIsLeft(): void
    {
        $this->recipeStockRepository->save(recipeStock: RecipeStock::start(
            id: 'recipe-stock-1',
            recipeId: 'recipe-1',
            servings: 6.0,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));

        ($this->handler)(new DecreaseRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: 2.0,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 4.0,
            actual: $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1')->servings,
        );
    }

    public function testItRecordsTheDeficitWhenTheRecipeHasNoStockYet(): void
    {
        ($this->handler)(new DecreaseRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: 3.0,
            updatedByUserId: 'god-user-id',
        ));

        $stock = $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1');

        $this->assertNotNull(actual: $stock);
        $this->assertSame(expected: -3.0, actual: $stock->servings);
    }

    public function testItGivesBackWhatItTookWhenTheStockStartedEmpty(): void
    {
        ($this->handler)(new DecreaseRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: 1.0,
            updatedByUserId: 'god-user-id',
        ));

        $stock = $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1');
        $stock->increase(
            servings: 1.0,
            updatedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->assertSame(expected: 0.0, actual: $stock->servings);
    }

    public function testItThrowsWhenTheRecipeDoesNotExist(): void
    {
        $this->expectException(exception: UpdateRecipeStockException::class);

        ($this->handler)(new DecreaseRecipeStockCommand(
            recipeId: 'missing',
            servings: 1.0,
            updatedByUserId: 'god-user-id',
        ));
    }
}
