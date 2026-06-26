<?php

namespace Mcp\Server\Mcp\Domain\Model;

use Shared\Shared\Shared\Domain\Model\Aggregate;

abstract class GenericAggregate extends Aggregate
{
    public string $id;
    public \DateTime $createdAt;
    public \DateTime $updatedAt;
    public string $createdByUserId;
    public string $updatedByUserId;
    private int $version = 1;

    public function aggregateVersion(): int
    {
        return $this->version;
    }
}
