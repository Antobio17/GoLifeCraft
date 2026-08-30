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
    public float $displayQuantity = 0.0;
    public ?string $displayUnit = null;
    public ?string $sourceProductionItemId = null;

    public static function take(
        string $productionItemId,
        ProductionCompositionLine $line,
        string $createdByUserId,
        \DateTime $now,
    ): self {
        $consumption = new self();
        $consumption->id = Uuid::uuid4()->toString();
        $consumption->productionItemId = $productionItemId;
        $consumption->kind = $line->kind;
        $consumption->refId = $line->refId;
        $consumption->quantity = $line->quantity;
        $consumption->unit = $line->unit;
        $consumption->displayQuantity = $line->displayQuantity;
        $consumption->displayUnit = $line->displayUnit;
        $consumption->sourceProductionItemId = $line->sourceProductionItemId;
        $consumption->stampCreation(userId: $createdByUserId, now: $now);

        return $consumption;
    }

    public function isArticle(): bool
    {
        return self::KIND_ARTICLE === $this->kind;
    }

    public function toLine(): ProductionCompositionLine
    {
        return new ProductionCompositionLine(
            kind: $this->kind,
            refId: $this->refId,
            quantity: $this->quantity,
            unit: $this->unit,
            displayQuantity: $this->displayQuantity,
            displayUnit: $this->displayUnit,
            sourceProductionItemId: $this->sourceProductionItemId,
        );
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
