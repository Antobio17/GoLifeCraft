<?php

namespace App\Tests\Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Application\Command\CreateRecipeCommand;
use Nutrition\Recipe\Recipe\Application\Command\CreateRecipeCommandHandler;
use Nutrition\Recipe\Recipe\Application\Command\RecipeIngredientAssembler;
use Nutrition\Recipe\Recipe\Application\Command\RecipeIngredientData;
use Nutrition\Recipe\Recipe\Application\Command\RecipeStepAssembler;
use Nutrition\Recipe\Recipe\Application\Command\RecipeStepData;
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
            recipeStepAssembler: new RecipeStepAssembler(dateTimeGenerator: $dateTimeGenerator),
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItCreatesARecipeWithIngredients(): void
    {
        ($this->handler)(new CreateRecipeCommand(
            name: 'Porridge de avena',
            emoji: '🥣',
            imageUrl: null,
            category: 'Desayuno',
            servings: 1,
            ingredients: [
                new RecipeIngredientData(kind: RecipeIngredient::KIND_PRODUCT, refId: 'article-1', quantity: 60.0, position: 1),
                new RecipeIngredientData(kind: RecipeIngredient::KIND_RECIPE, refId: 'recipe-9', quantity: 1.0, position: 2),
            ],
            steps: [],
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

    public function testItCreatesARecipeWithOrderedSteps(): void
    {
        ($this->handler)(new CreateRecipeCommand(
            name: 'Lentejas con chorizo',
            emoji: '🍲',
            imageUrl: null,
            category: 'Comida',
            servings: 4,
            ingredients: [],
            steps: [
                new RecipeStepData(text: 'Pon las lentejas en remojo', position: 1),
                new RecipeStepData(text: 'Sofríe la cebolla', position: 2, minutes: 10),
            ],
            createdByUserId: 'god-user-id',
        ));

        $recipe = $this->recipeRepository->findById(id: 'recipe-1');

        $this->assertCount(expectedCount: 2, haystack: $recipe->steps);
        $this->assertEquals(expected: $recipe->id, actual: $recipe->steps[0]->recipeId);
        $this->assertEquals(expected: 'Pon las lentejas en remojo', actual: $recipe->steps[0]->text);
        $this->assertNull(actual: $recipe->steps[0]->minutes);
        $this->assertEquals(expected: 2, actual: $recipe->steps[1]->position);
        $this->assertEquals(expected: 10, actual: $recipe->steps[1]->minutes);
    }

    public function testItCreatesARecipeWithoutStepsBecauseStepsAreOptional(): void
    {
        ($this->handler)(new CreateRecipeCommand(
            name: 'Tortilla francesa',
            emoji: '🍳',
            imageUrl: null,
            category: 'Cena',
            servings: 1,
            ingredients: [],
            steps: [],
            createdByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: [], actual: $this->recipeRepository->findById(id: 'recipe-1')->steps);
    }

    public function testItThrowsExceptionWhenRecipeNameAlreadyExists(): void
    {
        $this->needleDataQuery->addExistingName(name: 'Porridge de avena');

        $this->expectException(exception: CreateRecipeException::class);

        ($this->handler)(new CreateRecipeCommand(
            name: 'Porridge de avena',
            emoji: '🥣',
            imageUrl: null,
            category: 'Desayuno',
            servings: 1,
            ingredients: [],
            steps: [],
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsExceptionForNonPositiveServings(): void
    {
        $this->expectException(exception: CreateRecipeException::class);

        ($this->handler)(new CreateRecipeCommand(
            name: 'Porridge de avena',
            emoji: '🥣',
            imageUrl: null,
            category: 'Desayuno',
            servings: 0,
            ingredients: [],
            steps: [],
            createdByUserId: 'god-user-id',
        ));
    }
}
