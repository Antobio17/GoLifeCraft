<?php

namespace App\Tests\Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Application\Command\CreateRecipeCommand;
use Nutrition\Recipe\Recipe\Application\Command\CreateRecipeCommandHandler;
use Nutrition\Recipe\Recipe\Application\Command\RecipeIngredientAssembler;
use Nutrition\Recipe\Recipe\Application\Command\RecipeIngredientData;
use Nutrition\Recipe\Recipe\Application\Command\UpdateRecipeCommand;
use Nutrition\Recipe\Recipe\Application\Command\UpdateRecipeCommandHandler;
use Nutrition\Recipe\Recipe\Domain\Exception\UpdateRecipeException;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\Model\InMemory\InMemoryRecipeRepository;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateRecipeNeedleDataQuery;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateRecipeNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateRecipeCommandHandlerTest extends TestCase
{
    private InMemoryRecipeRepository $recipeRepository;
    private InMemoryUpdateRecipeNeedleDataQuery $needleDataQuery;
    private UpdateRecipeCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $assembler = new RecipeIngredientAssembler(dateTimeGenerator: $dateTimeGenerator);
        $domainEventCollectorService = new DomainEventCollectorService();
        $this->recipeRepository = new InMemoryRecipeRepository();
        $this->needleDataQuery = new InMemoryUpdateRecipeNeedleDataQuery();

        $createHandler = new CreateRecipeCommandHandler(
            recipeRepository: $this->recipeRepository,
            needleDataQuery: new InMemoryCreateRecipeNeedleDataQuery(),
            recipeIngredientAssembler: $assembler,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        ($createHandler)(new CreateRecipeCommand(
            name: 'Porridge de avena',
            emoji: '🥣',
            category: 'Desayuno',
            servings: 1,
            ingredients: [
                new RecipeIngredientData(kind: RecipeIngredient::KIND_PRODUCT, refId: 'article-1', quantity: 60.0, position: 1),
            ],
            createdByUserId: 'god-user-id',
        ));

        $this->needleDataQuery->addExistingName(recipeId: 'recipe-1', name: 'Porridge de avena');

        $this->handler = new UpdateRecipeCommandHandler(
            recipeRepository: $this->recipeRepository,
            needleDataQuery: $this->needleDataQuery,
            recipeIngredientAssembler: $assembler,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItReplacesIngredientsOnUpdate(): void
    {
        ($this->handler)(new UpdateRecipeCommand(
            recipeId: 'recipe-1',
            name: 'Bowl de pollo',
            emoji: '🥘',
            category: 'Comida',
            servings: 2,
            ingredients: [
                new RecipeIngredientData(kind: RecipeIngredient::KIND_PRODUCT, refId: 'article-4', quantity: 300.0, position: 1),
                new RecipeIngredientData(kind: RecipeIngredient::KIND_PRODUCT, refId: 'article-5', quantity: 150.0, position: 2),
            ],
            updatedByUserId: 'god-user-id',
        ));

        $recipe = $this->recipeRepository->findById(id: 'recipe-1');
        $this->assertEquals(expected: 'Bowl de pollo', actual: $recipe->name);
        $this->assertEquals(expected: 2, actual: $recipe->servings);
        $this->assertCount(expectedCount: 2, haystack: $recipe->ingredients);
        $this->assertEquals(expected: 'article-4', actual: $recipe->ingredients[0]->refId);
    }

    public function testItThrowsExceptionWhenAnotherRecipeHasTheSameName(): void
    {
        $this->needleDataQuery->addExistingName(recipeId: 'recipe-2', name: 'Ensalada');

        $this->expectException(exception: UpdateRecipeException::class);

        ($this->handler)(new UpdateRecipeCommand(
            recipeId: 'recipe-1',
            name: 'Ensalada',
            emoji: '🥗',
            category: 'Comida',
            servings: 2,
            ingredients: [],
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsExceptionWhenRecipeNotFound(): void
    {
        $this->expectException(exception: UpdateRecipeException::class);

        ($this->handler)(new UpdateRecipeCommand(
            recipeId: 'missing-id',
            name: 'Bowl de pollo',
            emoji: '🥘',
            category: 'Comida',
            servings: 2,
            ingredients: [],
            updatedByUserId: 'god-user-id',
        ));
    }
}
