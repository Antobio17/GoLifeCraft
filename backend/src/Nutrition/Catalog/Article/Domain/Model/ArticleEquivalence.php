<?php

namespace Nutrition\Catalog\Article\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class ArticleEquivalence extends GenericAggregate
{
    public string $articleId;
    public string $unit;
    public float $quantity;
    public int $position;

    public static function create(
        string $articleId,
        string $unit,
        float $quantity,
        int $position,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $equivalence = new self();
        $equivalence->id = Uuid::uuid4()->toString();
        $equivalence->articleId = $articleId;
        $equivalence->unit = $unit;
        $equivalence->quantity = $quantity;
        $equivalence->position = $position;
        $equivalence->stampCreation(userId: $createdByUserId, now: $now);

        return $equivalence;
    }
}
