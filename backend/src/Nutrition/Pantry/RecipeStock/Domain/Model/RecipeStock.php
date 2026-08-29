<?php

namespace Nutrition\Pantry\RecipeStock\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\RecipeStock\Domain\Event\RecipeStockChanged;
use Nutrition\Pantry\RecipeStock\Domain\Event\RecipeStockDeleted;
use Nutrition\Pantry\RecipeStock\Domain\Event\RecipeStockStarted;
use Nutrition\Pantry\RecipeStock\Domain\Exception\RecipeStockException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class RecipeStock extends GenericAggregate
{
    public string $recipeId;
    public float $servings = 0.0;

    public static function start(
        string $id,
        string $recipeId,
        float $servings,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        self::assertServingsAreNotNegative(servings: $servings);

        $now = $dateTimeGenerator->now();

        $stock = new self();
        $stock->id = $id;
        $stock->recipeId = $recipeId;
        $stock->servings = $servings;
        $stock->stampCreation(userId: $createdByUserId, now: $now);

        $stock->record(event: new RecipeStockStarted(
            aggregateId: $id,
            occurredOn: $now,
            recipeId: $recipeId,
            servings: $servings,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        ));

        return $stock;
    }

    public function change(
        float $servings,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->applyServings(
            servings: $servings,
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function increase(
        float $servings,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->applyServings(
            servings: $this->servings + $servings,
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function decrease(
        float $servings,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->applyServings(
            servings: round(num: $this->servings - $servings, precision: 2),
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
            allowNegative: true,
        );
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new RecipeStockDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            recipeId: $this->recipeId,
            servings: $this->servings,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    private function applyServings(
        float $servings,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
        bool $allowNegative = false,
    ): void {
        if (!$allowNegative) {
            self::assertServingsAreNotNegative(servings: $servings);
        }

        $now = $dateTimeGenerator->now();
        $previousServings = $this->servings;

        $this->servings = $servings;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new RecipeStockChanged(
            aggregateId: $this->id,
            occurredOn: $now,
            recipeId: $this->recipeId,
            previousServings: $previousServings,
            servings: $servings,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    private static function assertServingsAreNotNegative(float $servings): void
    {
        if ($servings < 0.0) {
            throw RecipeStockException::servingsCannotBeNegative(servings: $servings);
        }
    }
}
