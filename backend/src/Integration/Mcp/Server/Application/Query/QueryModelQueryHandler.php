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

        $this->guardFilters(descriptor: $descriptor, filters: $query->filters);
        $this->guardSort(descriptor: $descriptor, sort: $query->sort);
        $includedDescriptors = $this->resolveIncludes(descriptor: $descriptor, include: $query->include);

        $page = max(1, $query->page);
        $pageSize = min(100, max(1, $query->pageSize));

        $result = $this->readQuery->query(
            descriptor: $descriptor,
            filters: $query->filters,
            include: $query->include,
            sort: $query->sort,
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

    private function guardFilters(ModelDescriptor $descriptor, array $filters): void
    {
        foreach (array_keys($filters) as $name) {
            $field = $descriptor->field((string) $name);
            if (null !== $field && $field->filterable) {
                continue;
            }

            throw ModelValidationException::failed(errors: [(string) $name => 'is not filterable']);
        }
    }

    private function guardSort(ModelDescriptor $descriptor, array $sort): void
    {
        foreach ($sort as $clause) {
            $field = $descriptor->field($clause['field'] ?? '');
            if (null !== $field && $field->sortable) {
                continue;
            }

            throw ModelValidationException::failed(errors: [($clause['field'] ?? '') => 'is not sortable']);
        }
    }

    /**
     * @return array<string, ModelDescriptor>
     */
    private function resolveIncludes(ModelDescriptor $descriptor, array $include): array
    {
        $included = [];

        foreach ($include as $name) {
            $relation = $descriptor->relation($name);
            if (null === $relation || !$relation->expandable) {
                throw ModelValidationException::failed(errors: [$name => 'is not expandable']);
            }

            $included[$name] = $this->metadataProvider->describe(alias: $relation->target);
        }

        return $included;
    }
}
