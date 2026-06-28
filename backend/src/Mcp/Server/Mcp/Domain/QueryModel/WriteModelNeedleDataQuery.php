<?php

namespace Mcp\Server\Mcp\Domain\QueryModel;

interface WriteModelNeedleDataQuery
{
    public function modelAlreadyExists(string $class, string $field, mixed $value, ?string $excludeId): bool;
}
