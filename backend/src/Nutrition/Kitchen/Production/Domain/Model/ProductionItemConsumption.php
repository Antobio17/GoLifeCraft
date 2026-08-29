<?php

namespace Nutrition\Kitchen\Production\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;

class ProductionItemConsumption extends GenericAggregate
{
    public const string KIND_ARTICLE = 'article';
    public const string KIND_RECIPE = 'recipe';

    public string $productionItemId;
    public string $kind;
    public string $refId;
    public float $quantity;
    public ?string $unit = null;

    public static function take(
        string $productionItemId,
        string $kind,
        string $refId,
        float $quantity,
        ?string $unit,
        string $createdByUserId,
        \DateTime $now,
    ): self {
        $consumption = new self();
        $consumption->id = Uuid::uuid4()->toString();
        $consumption->productionItemId = $productionItemId;
        $consumption->kind = $kind;
        $consumption->refId = $refId;
        $consumption->quantity = $quantity;
        $consumption->unit = $unit;
        $consumption->stampCreation(userId: $createdByUserId, now: $now);

        return $consumption;
    }

    public function isArticle(): bool
    {
        return self::KIND_ARTICLE === $this->kind;
    }

    /**
     * @return array{articleId: string, quantity: float, unit: string}
     */
    public function toConsumedArticle(): array
    {
        return [
            'articleId' => $this->refId,
            'quantity' => $this->quantity,
            'unit' => (string) $this->unit,
        ];
    }

    /**
     * @return array{recipeId: string, servings: float}
     */
    public function toConsumedRecipe(): array
    {
        return ['recipeId' => $this->refId, 'servings' => $this->quantity];
    }
}
