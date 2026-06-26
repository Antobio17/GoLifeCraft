<?php

namespace Mcp\Server\Mcp\Domain\Service;

use Mcp\Server\Mcp\Domain\QueryModel\Dto\ModelDescriptor;

interface ModelReadQuery
{
    /**
     * @param array<string, ModelDescriptor> $includedDescriptors
     *
     * @return array{total: int, data: array<int, array<string, mixed>>}
     */
    public function query(
        ModelDescriptor $descriptor,
        array $filters,
        array $include,
        array $sort,
        int $page,
        int $pageSize,
        array $includedDescriptors,
    ): array;
}
