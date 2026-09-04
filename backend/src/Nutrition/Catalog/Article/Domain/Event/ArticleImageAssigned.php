<?php

namespace Nutrition\Catalog\Article\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ArticleImageAssigned extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $equivalences
     */
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $name,
        public ?string $brand,
        public ?string $emoji,
        public ?string $image,
        public string $baseUnit,
        public string $recipeUnit,
        public string $diaryUnit,
        public ?string $packUnit,
        public ?float $price,
        public ?string $categoryId,
        public ?string $supermarketId,
        public ?string $aisleId,
        public ?string $nutritionFactsId,
        public ?string $barcode,
        public array $equivalences,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.article.image_assigned';
    }
}
