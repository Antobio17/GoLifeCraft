<?php

namespace Nutrition\Catalog\Article\Domain\Event;

use Shared\Shared\Shared\Domain\Event\DomainEvent;

final readonly class ArticleDeleted extends DomainEvent
{
    /**
     * @param array<int, array<string, mixed>> $equivalences
     * @param array<string, mixed>|null        $nutritionFacts
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
        public ?array $nutritionFacts,
        public \DateTime $createdAt,
        public \DateTime $updatedAt,
        public string $createdByUserId,
        public string $deletedByUserId,
    ) {
        parent::__construct(aggregateId: $aggregateId, occurredOn: $occurredOn);
    }

    public function getName(): string
    {
        return 'golifecraft.nutrition.event.1.article.deleted';
    }
}
