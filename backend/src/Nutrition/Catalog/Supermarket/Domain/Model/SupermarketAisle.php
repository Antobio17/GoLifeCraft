<?php

namespace Nutrition\Catalog\Supermarket\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class SupermarketAisle extends GenericAggregate
{
    public const int NAME_MAX_LENGTH = 120;

    public string $supermarketId;
    public string $name;
    public int $position;

    public static function create(
        string $id,
        string $supermarketId,
        string $name,
        int $position,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $aisle = new self();
        $aisle->id = $id;
        $aisle->supermarketId = $supermarketId;
        $aisle->name = $name;
        $aisle->position = $position;
        $aisle->stampCreation(userId: $createdByUserId, now: $dateTimeGenerator->now());

        return $aisle;
    }

    public function reposition(
        string $name,
        int $position,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->name = $name;
        $this->position = $position;
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }
}
