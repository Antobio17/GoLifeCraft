<?php

namespace Nutrition\GlobalCatalog\Article\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class GlobalArticleUpdated extends DomainEvent
{
    public function __construct(
        string $aggregateId,
        \DateTime $occurredOn,
        public string $barcode,
        public string $name,
        public ?string $brand,
        public ?string $categoryName,
        public ?string $imageUrl,
        public ?string $quantity,
        public ?string $stores,
        public ?float $price,
        public ?float $bulkPrice,
        public ?float $referencePrice,
        public ?string $referenceFormat,
        public ?float $previousPrice,
        public string $source,
        public float $referenceAmount,
        public ?float $calories,
        public ?float $protein,
        public ?float $carbs,
        public ?float $sugars,
        public ?float $fat,
        public ?float $saturatedFat,
        public ?float $fiber,
        public ?float $salt,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $updatedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.global_article.updated';
    }
}
