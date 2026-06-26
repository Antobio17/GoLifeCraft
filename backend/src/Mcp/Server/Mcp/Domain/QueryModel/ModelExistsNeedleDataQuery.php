<?php

namespace Mcp\Server\Mcp\Domain\QueryModel;

interface ModelExistsNeedleDataQuery
{
    public function exists(string $class, string $field, mixed $value, ?string $excludeId): bool;
}
