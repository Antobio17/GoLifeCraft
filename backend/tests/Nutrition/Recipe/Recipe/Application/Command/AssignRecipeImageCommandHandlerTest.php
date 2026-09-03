<?php

namespace App\Tests\Nutrition\Recipe\Recipe\Application\Command;

use Nutrition\Recipe\Recipe\Application\Command\AssignRecipeImageCommand;
use Nutrition\Recipe\Recipe\Application\Command\AssignRecipeImageCommandHandler;
use Nutrition\Recipe\Recipe\Domain\Exception\AssignRecipeImageException;
use Nutrition\Recipe\Recipe\Domain\Model\Recipe;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\Model\InMemory\InMemoryRecipeRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Fake\FakeImageStoreService;

final class AssignRecipeImageCommandHandlerTest extends TestCase
{
    private InMemoryRecipeRepository $recipeRepository;
    private FakeImageStoreService $imageStorageService;
    private AssignRecipeImageCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->recipeRepository = new InMemoryRecipeRepository();
        $this->imageStorageService = new FakeImageStoreService();
        $this->handler = new AssignRecipeImageCommandHandler(
            recipeRepository: $this->recipeRepository,
            imageStorageService: $this->imageStorageService,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->recipeRepository->save(recipe: Recipe::create(
            id: 'recipe-1',
            name: 'Porridge de avena',
            emoji: '🥣',
            image: null,
            category: 'Desayuno',
            servings: 1,
            ingredients: [],
            steps: [],
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $dateTimeGenerator,
        ));
    }

    public function testItStoresTheImageUnderTheRecipe(): void
    {
        ($this->handler)(new AssignRecipeImageCommand(
            recipeId: 'recipe-1',
            imagePath: '/tmp/upload_1.jpg',
            updatedByUserId: 'god-user-id',
        ));

        $recipe = $this->recipeRepository->findById(id: 'recipe-1');

        $this->assertSame('upload_1.jpg', $recipe->image);
        $this->assertSame(
            ['aggregate' => 'recipe', 'aggregateId' => 'recipe-1', 'imagePath' => '/tmp/upload_1.jpg'],
            $this->imageStorageService->storedImages[0],
        );
    }

    public function testItRemovesTheImageWhenNoFileIsSent(): void
    {
        ($this->handler)(new AssignRecipeImageCommand(
            recipeId: 'recipe-1',
            imagePath: '/tmp/upload_1.jpg',
            updatedByUserId: 'god-user-id',
        ));
        ($this->handler)(new AssignRecipeImageCommand(
            recipeId: 'recipe-1',
            imagePath: null,
            updatedByUserId: 'god-user-id',
        ));

        $recipe = $this->recipeRepository->findById(id: 'recipe-1');

        $this->assertNull($recipe->image);
        $this->assertSame(
            ['aggregate' => 'recipe', 'aggregateId' => 'recipe-1', 'image' => 'upload_1.jpg'],
            $this->imageStorageService->deletedImages[0],
        );
    }

    public function testItThrowsWhenTheRecipeDoesNotExist(): void
    {
        $this->expectException(AssignRecipeImageException::class);

        ($this->handler)(new AssignRecipeImageCommand(
            recipeId: 'recipe-404',
            imagePath: '/tmp/upload_1.jpg',
            updatedByUserId: 'god-user-id',
        ));
    }
}
