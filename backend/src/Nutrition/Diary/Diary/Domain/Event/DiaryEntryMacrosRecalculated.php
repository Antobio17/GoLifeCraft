<?php

namespace Nutrition\Diary\Diary\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class DiaryEntryMacrosRecalculated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $entryDate,
        public string $meal,
        public string $kind,
        public string $refId,
        public float $quantity,
        public string $name,
        public string $emoji,
        public float $calories,
        public float $protein,
        public float $fat,
        public float $carbs,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.diary_entry.macros_recalculated';
    }
}
