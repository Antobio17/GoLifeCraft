<?php

namespace Mcp\Server\Mcp\Application\Query;

use Mcp\Server\Mcp\Domain\Service\ModelMetadataProvider;
use Mcp\Server\Mcp\Domain\Service\ModelPermissionChecker;

final readonly class DescribeModelsQueryHandler
{
    public function __construct(
        private ModelMetadataProvider $metadataProvider,
        private ModelPermissionChecker $permissionChecker,
    ) {
    }

    public function __invoke(DescribeModelsQuery $query): array
    {
        $aliases = [] === $query->aliases ? $this->metadataProvider->aliases() : $query->aliases;
        $models = [];

        foreach ($aliases as $alias) {
            if (!$this->metadataProvider->has(alias: $alias)) {
                continue;
            }

            $descriptor = $this->metadataProvider->describe(alias: $alias);

            if (!$this->permissionChecker->canRead(role: $query->role, descriptor: $descriptor)) {
                continue;
            }

            $models[] = $descriptor->toArray(
                writable: $this->permissionChecker->canWrite(role: $query->role, descriptor: $descriptor),
            );
        }

        return ['models' => $models];
    }
}
