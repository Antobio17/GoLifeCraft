<?php

namespace Integration\Mcp\Server\Domain\Model;

use Shared\Shared\Shared\Domain\Model\Aggregate;

abstract class GenericAggregate extends Aggregate
{
    public string $id;
    public \DateTime $createdAt;
    public \DateTime $updatedAt;
    public string $createdByUserId;
    public string $updatedByUserId;
    protected int $version;

    public function stampCreation(string $userId, \DateTime $now): void
    {
        $this->createdAt = $now;
        $this->createdByUserId = $userId;
        $this->stampUpdate(userId: $userId, now: $now);
    }

    public function stampUpdate(string $userId, \DateTime $now): void
    {
        $this->updatedAt = $now;
        $this->updatedByUserId = $userId;
    }
}
