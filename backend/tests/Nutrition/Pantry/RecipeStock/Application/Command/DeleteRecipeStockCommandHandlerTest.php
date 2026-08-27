<?php

namespace App\Tests\Nutrition\Pantry\RecipeStock\Application\Command;

use Nutrition\Pantry\RecipeStock\Application\Command\DeleteRecipeStockCommand;
use Nutrition\Pantry\RecipeStock\Application\Command\DeleteRecipeStockCommandHandler;
use Nutrition\Pantry\RecipeStock\Domain\Model\RecipeStock;
use Nutrition\Pantry\RecipeStock\Infrastructure\Domain\Model\InMemory\InMemoryRecipeStockRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteRecipeStockCommandHandlerTest extends TestCase
{
    private InMemoryRecipeStockRepository $recipeStockRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private DeleteRecipeStockCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->recipeStockRepository = new InMemoryRecipeStockRepository();
        $this->handler = new DeleteRecipeStockCommandHandler(
            recipeStockRepository: $this->recipeStockRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    public function testItDeletesTheStockOfTheRecipe(): void
    {
        $this->recipeStockRepository->save(recipeStock: RecipeStock::start(
            id: 'recipe-stock-1',
            recipeId: 'recipe-1',
            servings: 4.0,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));

        ($this->handler)(new DeleteRecipeStockCommand(
            recipeId: 'recipe-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-1'));
    }

    public function testItDoesNothingWhenTheRecipeHasNoStock(): void
    {
        ($this->handler)(new DeleteRecipeStockCommand(
            recipeId: 'recipe-without-stock',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->recipeStockRepository->findByRecipeId(recipeId: 'recipe-without-stock'));
    }
}
