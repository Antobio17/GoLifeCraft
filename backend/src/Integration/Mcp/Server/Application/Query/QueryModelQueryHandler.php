<?php

namespace Integration\Mcp\Server\Application\Query;

use Integration\Mcp\Server\Domain\Exception\ModelNotExposedException;
use Integration\Mcp\Server\Domain\Exception\ModelValidationException;
use Integration\Mcp\Server\Domain\QueryModel\Dto\ModelDescriptor;
use Integration\Mcp\Server\Domain\Service\ModelMetadataProvider;
use Integration\Mcp\Server\Domain\Service\ModelPermissionChecker;
use Integration\Mcp\Server\Domain\Service\ModelReadQuery;

final readonly class QueryModelQueryHandler
{
    public function __construct(
        private ModelMetadataProvider $metadataProvider,
        private ModelPermissionChecker $permissionChecker,
        private ModelReadQuery $readQuery,
    ) {
    }

    public function __invoke(QueryModelQuery $query): array
    {
        $descriptor = $this->metadataProvider->describe(alias: $query->alias);

        if (!$this->permissionChecker->canRead(role: $query->role, descriptor: $descriptor)) {
            throw ModelNotExposedException::alias(alias: $query->alias);
        }

        $filters = $this->canonicalFilters(descriptor: $descriptor, filters: $query->filters);
        $sort = $this->canonicalSort(descriptor: $descriptor, sort: $query->sort);
        $includedDescriptors = $this->resolveIncludes(descriptor: $descriptor, include: $query->include);

        $page = max(1, $query->page);
        $pageSize = min(100, max(1, $query->pageSize));

        $result = $this->readQuery->query(
            descriptor: $descriptor,
            filters: $filters,
            include: array_keys($includedDescriptors),
            sort: $sort,
            page: $page,
            pageSize: $pageSize,
            includedDescriptors: $includedDescriptors,
        );

        return [
            'meta' => [
                'page' => $page,
                'pageSize' => $pageSize,
                'total' => $result['total'],
            ],
            'data' => $result['data'],
        ];
    }

    /**
     * @param array<string, mixed> $filters
     *
     * @return array<string, mixed> keyed by the field name the descriptor holds, never by the key the client sent
     */
    private function canonicalFilters(ModelDescriptor $descriptor, array $filters): array
    {
        $canonical = [];

        foreach ($filters as $name => $condition) {
            $field = $descriptor->field((string) $name);

            if (null === $field || !$field->filterable) {
                throw ModelValidationException::failed(errors: [(string) $name => 'is not filterable']);
            }

            $canonical[$field->name] = $condition;
        }

        return $canonical;
    }

    /**
     * @param array<int, array{field?: string, dir?: string}> $sort
     *
     * @return array<int, array{field: string, dir: string}> built from the descriptor, never from the key the client sent
     */
    private function canonicalSort(ModelDescriptor $descriptor, array $sort): array
    {
        $canonical = [];

        foreach ($sort as $clause) {
            $field = $descriptor->field($clause['field'] ?? '');

            if (null === $field || !$field->sortable) {
                throw ModelValidationException::failed(errors: [($clause['field'] ?? '') => 'is not sortable']);
            }

            $canonical[] = ['field' => $field->name, 'dir' => 'desc' === ($clause['dir'] ?? 'asc') ? 'desc' : 'asc'];
        }

        return $canonical;
    }

    /**
     * @param string[] $include
     *
     * @return array<string, ModelDescriptor> keyed by the relation name the descriptor holds
     */
    private function resolveIncludes(ModelDescriptor $descriptor, array $include): array
    {
        $included = [];

        foreach ($include as $name) {
            $relation = $descriptor->relation($name);

            if (null === $relation || !$relation->expandable) {
                throw ModelValidationException::failed(errors: [$name => 'is not expandable']);
            }

            $included[$relation->name] = $this->metadataProvider->describe(alias: $relation->target);
        }

        return $included;
    }
}
