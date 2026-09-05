<?php

namespace Nutrition\Pantry\Location\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class LocationItem extends GenericAggregate
{
    public string $locationId;
    public string $kind;
    public string $refId;

    public static function place(
        string $locationId,
        string $kind,
        string $refId,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $item = new self();
        $item->id = Uuid::uuid4()->toString();
        $item->locationId = $locationId;
        $item->kind = $kind;
        $item->refId = $refId;
        $item->stampCreation(userId: $createdByUserId, now: $now);

        return $item;
    }

    public function is(string $kind, string $refId): bool
    {
        return $this->kind === $kind && $this->refId === $refId;
    }
}
