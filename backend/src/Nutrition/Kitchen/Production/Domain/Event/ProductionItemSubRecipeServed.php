<?php

namespace Nutrition\Kitchen\Production\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ProductionItemSubRecipeServed extends DomainEvent
{
    /**
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string, displayQuantity: float, displayUnit: ?string, sourceProductionItemId: ?string}> $composition
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $itemId,
        public string $recipeId,
        public string $subRecipeId,
        public ?string $sourceProductionItemId,
        public string $status,
        public float $servingsPlanned,
        public float $servingsCooked,
        public string $nameSnapshot,
        public string $emojiSnapshot,
        public ?string $code,
        public string $label,
        public bool $customized,
        public array $composition,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.production.item_sub_recipe_served';
    }
}
