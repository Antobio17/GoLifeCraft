<?php

namespace App\Tests\Nutrition\Pantry\RecipeStock\Application\Command;

use Nutrition\Pantry\RecipeStock\Application\Command\UpdateRecipeStockCommand;
use Nutrition\Pantry\RecipeStock\Application\Command\UpdateRecipeStockCommandHandler;
use Nutrition\Pantry\RecipeStock\Domain\Exception\RecipeStockException;
use Nutrition\Pantry\RecipeStock\Domain\Exception\UpdateRecipeStockException;
use Nutrition\Pantry\RecipeStock\Infrastructure\Domain\Model\InMemory\InMemoryRecipeStockRepository;
use Nutrition\Pantry\RecipeStock\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateRecipeStockNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateRecipeStockCommandHandlerTest extends TestCase
{
    private InMemoryRecipeStockRepository $recipeStockRepository;
    private UpdateRecipeStockCommandHandler $handler;

    protected function setUp(): void
    {
        $this->recipeStockRepository = new InMemoryRecipeStockRepository();
        $this->handler = new UpdateRecipeStockCommandHandler(
            recipeStockRepository: $this->recipeStockRepository,
            needleDataQuery: new InMemoryUpdateRecipeStockNeedleDataQuery(recipeIds: ['recipe-1']),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItStartsTheStockOfARecipeWithoutStockYet(): void
    {
        ($this->handler)(new UpdateRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: 6.0,
            updatedByUserId: 'god-user-id',
        ));

        $stock = $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1');

        $this->assertNotNull(actual: $stock);
        $this->assertSame(expected: 6.0, actual: $stock->servings);
    }

    public function testItChangesTheStockKeepingTheSameAggregate(): void
    {
        ($this->handler)(new UpdateRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: 6.0,
            updatedByUserId: 'god-user-id',
        ));
        $startedId = $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1')->id;

        ($this->handler)(new UpdateRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: 2.0,
            updatedByUserId: 'god-user-id',
        ));

        $stock = $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1');

        $this->assertSame(expected: $startedId, actual: $stock->id);
        $this->assertSame(expected: 2.0, actual: $stock->servings);
    }

    public function testItEmptiesTheStockBecauseNothingIsLeft(): void
    {
        ($this->handler)(new UpdateRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: 4.0,
            updatedByUserId: 'god-user-id',
        ));

        ($this->handler)(new UpdateRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: 0.0,
            updatedByUserId: 'god-user-id',
        ));

        $this->assertSame(
            expected: 0.0,
            actual: $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1')->servings,
        );
    }

    public function testItThrowsWhenServingsAreNegative(): void
    {
        $this->expectException(exception: RecipeStockException::class);

        ($this->handler)(new UpdateRecipeStockCommand(
            recipeId: 'recipe-1',
            servings: -1.0,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheRecipeDoesNotExist(): void
    {
        $this->expectException(exception: UpdateRecipeStockException::class);

        ($this->handler)(new UpdateRecipeStockCommand(
            recipeId: 'missing',
            servings: 4.0,
            updatedByUserId: 'god-user-id',
        ));
    }
}
