<?php

namespace Nutrition\Recipe\Recipe\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class RecipeIngredient extends GenericAggregate
{
    public const KIND_PRODUCT = 'product';
    public const KIND_RECIPE = 'recipe';

    public string $recipeId;
    public string $kind;
    public string $refId;
    public float $quantity;
    public int $position;

    public static function create(
        string $recipeId,
        string $kind,
        string $refId,
        float $quantity,
        int $position,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $ingredient = new self();
        $ingredient->id = Uuid::uuid4()->toString();
        $ingredient->recipeId = $recipeId;
        $ingredient->kind = $kind;
        $ingredient->refId = $refId;
        $ingredient->quantity = $quantity;
        $ingredient->position = $position;
        $ingredient->stampCreation(userId: $createdByUserId, now: $now);

        return $ingredient;
    }
}
