<?php

namespace Nutrition\Catalog\Supermarket\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Supermarket extends GenericAggregate
{
    public string $name;

    public static function create(
        string $id,
        string $name,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $supermarket = new self();
        $supermarket->id = $id;
        $supermarket->name = $name;
        $supermarket->stampCreation(userId: $createdByUserId, now: $dateTimeGenerator->now());

        return $supermarket;
    }
}
