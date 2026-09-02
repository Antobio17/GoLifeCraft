<?php

namespace Nutrition\Catalog\Article\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ArticleCreated extends DomainEvent
{
    /**
     * @param array<int, array{unit: string, quantity: float, position: int}> $equivalences
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public ?string $emoji,
        public ?string $imageUrl,
        public string $baseUnit,
        public string $recipeUnit,
        public string $diaryUnit,
        public ?string $packUnit,
        public array $equivalences,
        public ?string $supermarketId,
        public ?string $aisleId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.article.created';
    }
}
