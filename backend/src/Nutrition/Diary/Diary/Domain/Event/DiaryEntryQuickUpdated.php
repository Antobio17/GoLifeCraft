<?php

namespace Nutrition\Diary\Diary\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class DiaryEntryQuickUpdated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $entryDate,
        public string $meal,
        public float $quantity,
        public string $quickName,
        public string $quickEmoji,
        public float $quickCalories,
        public float $quickProtein,
        public float $quickFat,
        public float $quickCarbs,
        public string $name,
        public string $emoji,
        public float $calories,
        public float $protein,
        public float $fat,
        public float $carbs,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.diary_entry.quick_updated';
    }
}
