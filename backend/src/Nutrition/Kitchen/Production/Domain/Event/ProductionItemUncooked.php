<?php

namespace Nutrition\Kitchen\Production\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ProductionItemUncooked extends DomainEvent
{
    /**
     * @param array<int, array{kind: string, refId: string, quantity: float, unit: ?string, displayQuantity: float, displayUnit: ?string}> $composition
     * @param array<int, array{articleId: string, quantity: float, unit: string}>                                                          $consumedArticles
     * @param array<int, array{recipeId: string, servings: float}>                                                                         $consumedRecipes
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $itemId,
        public string $recipeId,
        public string $fromDate,
        public string $toDate,
        public float $servingsPlanned,
        public float $servingsCooked,
        public string $nameSnapshot,
        public string $emojiSnapshot,
        public ?string $code,
        public string $label,
        public bool $customized,
        public array $composition,
        public array $consumedArticles,
        public array $consumedRecipes,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.production.item_uncooked';
    }
}
