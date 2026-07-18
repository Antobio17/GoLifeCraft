<?php

namespace Nutrition\Catalog\Category\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
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
        $category = new self();
        $category->id = $id;
        $category->name = $name;
        $category->stampCreation(userId: $createdByUserId, now: $dateTimeGenerator->now());

        return $category;
    }
}
