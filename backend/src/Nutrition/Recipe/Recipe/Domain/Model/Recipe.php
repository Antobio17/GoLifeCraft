<?php

namespace Nutrition\Recipe\Recipe\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeCreated;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeDeleted;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeUpdated;
use Nutrition\Recipe\Recipe\Domain\Exception\CreateRecipeException;
use Nutrition\Recipe\Recipe\Domain\Exception\UpdateRecipeException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Recipe extends GenericAggregate
{
    public string $name;
    public string $emoji;
    public ?string $imageUrl = null;
    public string $category;
    public int $servings;

    /** @var RecipeIngredient[] */
    public array $ingredients = [];

    /** @var RecipeStep[] */
    public array $steps = [];

    /**
     * @param RecipeIngredient[] $ingredients
     * @param RecipeStep[]       $steps
     */
    public static function create(
        string $id,
        string $name,
        string $emoji,
        ?string $imageUrl,
        string $category,
        int $servings,
        array $ingredients,
        array $steps,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidServings(servings: $servings)) {
            throw CreateRecipeException::servingsMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $recipe = new self();
        $recipe->id = $id;
        $recipe->name = $name;
        $recipe->emoji = $emoji;
        $recipe->imageUrl = $imageUrl;
        $recipe->category = $category;
        $recipe->servings = $servings;
        $recipe->ingredients = $ingredients;
        $recipe->steps = $steps;
        $recipe->stampCreation(userId: $createdByUserId, now: $now);

        $recipe->record(event: new RecipeCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
            emoji: $emoji,
            imageUrl: $imageUrl,
            category: $category,
            servings: $servings,
            ingredients: $recipe->recordedIngredients(),
            steps: $recipe->recordedSteps(),
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        ));

        return $recipe;
    }

    /**
     * @param RecipeIngredient[] $ingredients
     * @param RecipeStep[]       $steps
     */
    public function update(
        string $name,
        string $emoji,
        ?string $imageUrl,
        string $category,
        int $servings,
        array $ingredients,
        array $steps,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidServings(servings: $servings)) {
            throw UpdateRecipeException::servingsMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->emoji = $emoji;
        $this->imageUrl = $imageUrl;
        $this->category = $category;
        $this->servings = $servings;
        $this->ingredients = $ingredients;
        $this->steps = $steps;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new RecipeUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $name,
            emoji: $emoji,
            imageUrl: $imageUrl,
            category: $category,
            servings: $servings,
            ingredients: $this->recordedIngredients(),
            steps: $this->recordedSteps(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new RecipeDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            emoji: $this->emoji,
            imageUrl: $this->imageUrl,
            category: $this->category,
            servings: $this->servings,
            ingredients: $this->recordedIngredients(),
            steps: $this->recordedSteps(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    /**
     * @return array<int, array{kind: string, refId: string, quantity: float, unit: ?string, position: int}>
     */
    private function recordedIngredients(): array
    {
        return array_map(
            callback: static fn (RecipeIngredient $ingredient): array => $ingredient->toRecordedIngredient(),
            array: $this->ingredients,
        );
    }

    /**
     * @return array<int, array{position: int, text: string, minutes: ?int}>
     */
    private function recordedSteps(): array
    {
        return array_map(
            callback: static fn (RecipeStep $step): array => $step->toRecordedStep(),
            array: $this->steps,
        );
    }

    private static function hasValidServings(int $servings): bool
    {
        return $servings >= 1;
    }
}
