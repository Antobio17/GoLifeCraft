<?php

namespace Nutrition\Pantry\RecipeStock\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\RecipeStock\Domain\Event\RecipeStockChanged;
use Nutrition\Pantry\RecipeStock\Domain\Event\RecipeStockDeleted;
use Nutrition\Pantry\RecipeStock\Domain\Event\RecipeStockStarted;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class RecipeStock extends GenericAggregate
{
    public const int SERVINGS_PRECISION = 2;

    public string $recipeId;
    public float $servings = 0.0;

    public static function start(
        string $id,
        string $recipeId,
        float $servings,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $stock = new self();
        $stock->id = $id;
        $stock->recipeId = $recipeId;
        $stock->servings = round(num: $servings, precision: self::SERVINGS_PRECISION);
        $stock->stampCreation(userId: $createdByUserId, now: $now);

        $stock->record(event: new RecipeStockStarted(
            aggregateId: $id,
            occurredOn: $now,
            recipeId: $recipeId,
            servings: $stock->servings,
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
        $now = $dateTimeGenerator->now();
        $previousServings = $this->servings;

        $this->servings = round(num: $servings, precision: self::SERVINGS_PRECISION);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new RecipeStockChanged(
            aggregateId: $this->id,
            occurredOn: $now,
            recipeId: $this->recipeId,
            previousServings: $previousServings,
            servings: $this->servings,
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
}
