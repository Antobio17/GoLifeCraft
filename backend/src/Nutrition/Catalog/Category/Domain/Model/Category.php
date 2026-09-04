<?php

namespace Nutrition\Catalog\Category\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Catalog\Category\Domain\Event\CategoryCreated;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Category extends GenericAggregate
{
    public string $name;

    public static function create(
        string $id,
        string $name,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $category = new self();
        $category->id = $id;
        $category->name = $name;
        $category->stampCreation(userId: $createdByUserId, now: $now);

        $category->record(event: new CategoryCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        ));

        return $category;
    }
}
