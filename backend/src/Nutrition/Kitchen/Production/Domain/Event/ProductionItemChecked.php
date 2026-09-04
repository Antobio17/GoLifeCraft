<?php

namespace Nutrition\Kitchen\Production\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ProductionItemChecked extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $items
     * @param string[]                         $checkedArticleIds
     * @param int[]                            $checkedStepPositions
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $itemId,
        public string $recipeId,
        public string $fromDate,
        public string $toDate,
        public string $status,
        public array $items,
        public string $itemStatus,
        public array $checkedArticleIds,
        public array $checkedStepPositions,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.production.item_checked';
    }
}
