<?php

namespace App\Tests\Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Application\Command\CreateRecipeCommand;
use Nutrition\Recipe\Recipe\Application\Command\CreateRecipeCommandHandler;
use Nutrition\Recipe\Recipe\Application\Command\DeleteRecipeCommand;
use Nutrition\Recipe\Recipe\Application\Command\DeleteRecipeCommandHandler;
use Nutrition\Recipe\Recipe\Application\Command\RecipeIngredientAssembler;
use Nutrition\Recipe\Recipe\Application\Command\RecipeIngredientData;
use Nutrition\Recipe\Recipe\Domain\Exception\DeleteRecipeException;
use Nutrition\Recipe\Recipe\Domain\Model\RecipeIngredient;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\Model\InMemory\InMemoryRecipeRepository;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateRecipeNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteRecipeCommandHandlerTest extends TestCase
{
    private InMemoryRecipeRepository $recipeRepository;
    private DeleteRecipeCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $domainEventCollectorService = new DomainEventCollectorService();
        $this->recipeRepository = new InMemoryRecipeRepository();

        $createHandler = new CreateRecipeCommandHandler(
            recipeRepository: $this->recipeRepository,
            needleDataQuery: new InMemoryCreateRecipeNeedleDataQuery(),
            recipeIngredientAssembler: new RecipeIngredientAssembler(dateTimeGenerator: $dateTimeGenerator),
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

        $this->handler = new DeleteRecipeCommandHandler(
            recipeRepository: $this->recipeRepository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItDeletesRecipe(): void
    {
        ($this->handler)(new DeleteRecipeCommand(
            recipeId: 'recipe-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->recipeRepository->findById(id: 'recipe-1'));
    }

    public function testItThrowsExceptionWhenRecipeNotFound(): void
    {
        $this->expectException(exception: DeleteRecipeException::class);

        ($this->handler)(new DeleteRecipeCommand(
            recipeId: 'missing-id',
            deletedByUserId: 'god-user-id',
        ));
    }
}
