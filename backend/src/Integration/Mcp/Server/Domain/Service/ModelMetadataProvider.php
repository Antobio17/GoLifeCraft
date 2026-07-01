<?php

namespace Integration\Mcp\Server\Domain\Service;

use Integration\Mcp\Server\Domain\QueryModel\Dto\ModelDescriptor;

interface ModelMetadataProvider
{
    /** @return string[] */
    public function aliases(): array;

    public function has(string $alias): bool;

    public function describe(string $alias): ModelDescriptor;
}
