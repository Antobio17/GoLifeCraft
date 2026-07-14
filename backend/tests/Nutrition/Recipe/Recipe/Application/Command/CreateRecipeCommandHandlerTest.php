<?php

namespace App\Tests\Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Application\Command\CreateRecipeCommand;
use Nutrition\Recipe\Recipe\Application\Command\CreateRecipeCommandHandler;
use Nutrition\Recipe\Recipe\Application\Command\RecipeIngredientAssembler;
use Nutrition\Recipe\Recipe\Application\Command\RecipeIngredientData;
use Nutrition\Recipe\Recipe\Domain\Exception\CreateRecipeException;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\Model\InMemory\InMemoryRecipeRepository;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateRecipeNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateRecipeCommandHandlerTest extends TestCase
{
    private InMemoryRecipeRepository $recipeRepository;
    private InMemoryCreateRecipeNeedleDataQuery $needleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private CreateRecipeCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->recipeRepository = new InMemoryRecipeRepository();
        $this->needleDataQuery = new InMemoryCreateRecipeNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new CreateRecipeCommandHandler(
            recipeRepository: $this->recipeRepository,
            needleDataQuery: $this->needleDataQuery,
            recipeIngredientAssembler: new RecipeIngredientAssembler(dateTimeGenerator: $dateTimeGenerator),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItCreatesARecipeWithIngredients(): void
    {
        ($this->handler)(new CreateRecipeCommand(
            name: 'Porridge de avena',
            emoji: '🥣',
            category: 'Desayuno',
            servings: 1,
            ingredients: [
                new RecipeIngredientData(kind: RecipeIngredient::KIND_PRODUCT, refId: 'article-1', quantity: 60.0, position: 1),
                new RecipeIngredientData(kind: RecipeIngredient::KIND_RECIPE, refId: 'recipe-9', quantity: 1.0, position: 2),
            ],
            createdByUserId: 'god-user-id',
        ));

        $recipe = $this->recipeRepository->findById(id: 'recipe-1');
        $this->assertNotNull(actual: $recipe);
        $this->assertEquals(expected: 'Porridge de avena', actual: $recipe->name);
        $this->assertEquals(expected: 'Desayuno', actual: $recipe->category);
        $this->assertCount(expectedCount: 2, haystack: $recipe->ingredients);
        $this->assertEquals(expected: $recipe->id, actual: $recipe->ingredients[0]->recipeId);
        $this->assertEquals(expected: RecipeIngredient::KIND_RECIPE, actual: $recipe->ingredients[1]->kind);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItThrowsExceptionWhenRecipeNameAlreadyExists(): void
    {
        $this->needleDataQuery->addExistingName(name: 'Porridge de avena');

        $this->expectException(exception: CreateRecipeException::class);

        ($this->handler)(new CreateRecipeCommand(
            name: 'Porridge de avena',
            emoji: '🥣',
            category: 'Desayuno',
            servings: 1,
            ingredients: [],
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsExceptionForNonPositiveServings(): void
    {
        $this->expectException(exception: CreateRecipeException::class);

        ($this->handler)(new CreateRecipeCommand(
            name: 'Porridge de avena',
            emoji: '🥣',
            category: 'Desayuno',
            servings: 0,
            ingredients: [],
            createdByUserId: 'god-user-id',
        ));
    }
}
