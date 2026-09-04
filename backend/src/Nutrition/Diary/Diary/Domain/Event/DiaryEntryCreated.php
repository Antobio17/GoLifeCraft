<?php

namespace Nutrition\Diary\Diary\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class DiaryEntryCreated extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $tree
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $entryDate,
        public string $meal,
        public string $kind,
        public ?string $refId,
        public ?string $productionItemId,
        public float $quantity,
        public ?string $unit,
        public string $name,
        public string $emoji,
        public float $calories,
        public float $protein,
        public float $fat,
        public float $carbs,
        public string $quickName,
        public string $quickEmoji,
        public float $quickCalories,
        public float $quickProtein,
        public float $quickFat,
        public float $quickCarbs,
        public bool $customized,
        public bool $consumed,
        public array $tree,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.diary_entry.created';
    }
}
