<?php

namespace Mcp\Server\Mcp\Domain\Service;

use Mcp\Server\Mcp\Domain\QueryModel\Dto\ModelDescriptor;

final class ModelPermissionChecker
{
    public function canRead(string $role, ModelDescriptor $descriptor): bool
    {
        return in_array(needle: $role, haystack: $descriptor->readRoles, strict: true);
    }

    public function canWrite(string $role, ModelDescriptor $descriptor): bool
    {
        return in_array(needle: $role, haystack: $descriptor->writeRoles, strict: true);
    }
}
