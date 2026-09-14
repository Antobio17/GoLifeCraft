<?php

namespace Nutrition\Recipe\Recipe\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeCreated;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeDeleted;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeImageAssigned;
use Nutrition\Recipe\Recipe\Domain\Event\RecipeUpdated;
use Nutrition\Recipe\Recipe\Domain\Exception\CreateRecipeException;
use Nutrition\Recipe\Recipe\Domain\Exception\UpdateRecipeException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Recipe extends GenericAggregate
{
    public const string PREP_MODE_BATCH = 'batch';
    public const string PREP_MODE_SAME_DAY = 'same_day';

    /** @var array<int, string> */
    public const array PREP_MODES = [
        self::PREP_MODE_BATCH,
        self::PREP_MODE_SAME_DAY,
    ];

    public string $name;
    public string $emoji;
    public ?string $image = null;
    public string $category;
    public int $servings;
    public string $prepMode = self::PREP_MODE_BATCH;

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
        ?string $image,
        string $category,
        int $servings,
        string $prepMode,
        array $ingredients,
        array $steps,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!self::hasValidServings(servings: $servings)) {
            throw CreateRecipeException::servingsMustBePositive();
        }

        if (!self::hasValidPrepMode(prepMode: $prepMode)) {
            throw CreateRecipeException::invalidPrepMode(prepMode: $prepMode);
        }

        $now = $dateTimeGenerator->now();

        $recipe = new self();
        $recipe->id = $id;
        $recipe->name = $name;
        $recipe->emoji = $emoji;
        $recipe->image = $image;
        $recipe->category = $category;
        $recipe->servings = $servings;
        $recipe->prepMode = $prepMode;
        $recipe->ingredients = $ingredients;
        $recipe->steps = $steps;
        $recipe->stampCreation(userId: $createdByUserId, now: $now);

        $recipe->record(event: new RecipeCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
            emoji: $emoji,
            image: $image,
            category: $category,
            servings: $servings,
            prepMode: $prepMode,
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
        ?string $image,
        string $category,
        int $servings,
        string $prepMode,
        array $ingredients,
        array $steps,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidServings(servings: $servings)) {
            throw UpdateRecipeException::servingsMustBePositive();
        }

        if (!self::hasValidPrepMode(prepMode: $prepMode)) {
            throw UpdateRecipeException::invalidPrepMode(prepMode: $prepMode);
        }

        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->emoji = $emoji;
        $this->image = $image;
        $this->category = $category;
        $this->servings = $servings;
        $this->prepMode = $prepMode;
        $this->ingredients = $ingredients;
        $this->steps = $steps;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new RecipeUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $name,
            emoji: $emoji,
            image: $image,
            category: $category,
            servings: $servings,
            prepMode: $prepMode,
            ingredients: $this->recordedIngredients(),
            steps: $this->recordedSteps(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function assignImage(
        ?string $image,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->image = $image;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new RecipeImageAssigned(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            emoji: $this->emoji,
            image: $image,
            category: $this->category,
            servings: $this->servings,
            prepMode: $this->prepMode,
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
            image: $this->image,
            category: $this->category,
            servings: $this->servings,
            prepMode: $this->prepMode,
            ingredients: $this->recordedIngredients(),
            steps: $this->recordedSteps(),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recordedIngredients(): array
    {
        return self::snapshotAll(aggregates: $this->ingredients);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recordedSteps(): array
    {
        return self::snapshotAll(aggregates: $this->steps);
    }

    private static function hasValidServings(int $servings): bool
    {
        return $servings >= 1;
    }

    private static function hasValidPrepMode(string $prepMode): bool
    {
        return in_array(needle: $prepMode, haystack: self::PREP_MODES, strict: true);
    }
}
