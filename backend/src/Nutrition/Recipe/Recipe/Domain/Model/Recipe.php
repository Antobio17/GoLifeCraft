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
    public string $category;
    public int $servings;

    /** @var RecipeIngredient[] */
    public array $ingredients = [];

    /**
     * @param RecipeIngredient[] $ingredients
     */
    public static function create(
        string $id,
        string $name,
        string $emoji,
        string $category,
        int $servings,
        array $ingredients,
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
        $recipe->category = $category;
        $recipe->servings = $servings;
        $recipe->ingredients = $ingredients;
        $recipe->stampCreation(userId: $createdByUserId, now: $now);

        $recipe->record(event: new RecipeCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
        ));

        return $recipe;
    }

    /**
     * @param RecipeIngredient[] $ingredients
     */
    public function update(
        string $name,
        string $emoji,
        string $category,
        int $servings,
        array $ingredients,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!self::hasValidServings(servings: $servings)) {
            throw UpdateRecipeException::servingsMustBePositive();
        }

        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->emoji = $emoji;
        $this->category = $category;
        $this->servings = $servings;
        $this->ingredients = $ingredients;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new RecipeUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $name,
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
        ));
    }

    private static function hasValidServings(int $servings): bool
    {
        return $servings >= 1;
    }
}
