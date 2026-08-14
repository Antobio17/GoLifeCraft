<?php

namespace Nutrition\Menu\Menu\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class MenuItemTreeAdjusted extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $tree
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public string $type,
        public string $menuItemId,
        public ?string $dayKey,
        public string $meal,
        public string $kind,
        public string $refId,
        public float $quantity,
        public ?string $unit,
        public int $position,
        public bool $customized,
        public array $tree,
        public float $calories,
        public float $protein,
        public float $fat,
        public float $carbs,
        public \DateTime $updatedAt,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.menu.item.tree.adjusted';
    }
}
