<?php

namespace Nutrition\Pantry\RecipeStock\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Pantry\RecipeStock\Domain\Event\RecipeStockChanged;
use Nutrition\Pantry\RecipeStock\Domain\Event\RecipeStockDeleted;
use Nutrition\Pantry\RecipeStock\Domain\Event\RecipeStockMoved;
use Nutrition\Pantry\RecipeStock\Domain\Event\RecipeStockStarted;
use Nutrition\Pantry\RecipeStock\Domain\Exception\RecipeStockException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class RecipeStock extends GenericAggregate
{
    private const int SERVINGS_PRECISION = 2;

    public string $recipeId;
    public float $servings = 0.0;
    public ?string $locationId = null;

    public static function start(
        string $id,
        string $recipeId,
        float $servings,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
        ?string $locationId = null,
    ): self {
        self::assertServingsAreNotNegative(servings: $servings);

        $now = $dateTimeGenerator->now();

        $stock = new self();
        $stock->id = $id;
        $stock->recipeId = $recipeId;
        $stock->servings = $servings;
        $stock->locationId = $locationId;
        $stock->stampCreation(userId: $createdByUserId, now: $now);

        $stock->record(event: new RecipeStockStarted(
            aggregateId: $id,
            occurredOn: $now,
            recipeId: $recipeId,
            servings: $servings,
            locationId: $locationId,
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
        self::assertServingsAreNotNegative(servings: $servings);

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
        self::assertServingsAreNotNegative(servings: $this->servings + $servings);

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
            servings: $this->servings - $servings,
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function moveTo(
        ?string $locationId,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $previousLocationId = $this->locationId;

        $this->locationId = $locationId;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new RecipeStockMoved(
            aggregateId: $this->id,
            occurredOn: $now,
            recipeId: $this->recipeId,
            servings: $this->servings,
            previousLocationId: $previousLocationId,
            locationId: $locationId,
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
            locationId: $this->locationId,
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
            locationId: $this->locationId,
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
