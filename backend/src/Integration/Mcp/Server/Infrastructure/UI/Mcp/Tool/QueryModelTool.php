<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Application\Query\QueryModelQuery;
use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(name: 'query_model')]
final class QueryModelTool extends McpMessengerTool
{
    /**
     * @param array<string, mixed>                          $filters
     * @param string[]                                      $include
     * @param array<int, array{field: string, dir: string}> $sort
     */
    public function __invoke(
        string $alias,
        #[Schema(
            type: 'object',
            description: 'A field-to-condition map (e.g. {"name": {"contains": "rice"}, "categoryId": "uuid"}). A bare value matches exactly; {"contains": "text"} matches a substring. Only fields the resource reports as filterable are accepted.',
            additionalProperties: true,
        )]
        array $filters = [],
        #[Schema(
            type: 'array',
            description: 'Relation names to expand, as reported by describe_models.',
            items: ['type' => 'string'],
        )]
        array $include = [],
        #[Schema(
            type: 'array',
            description: 'Order clauses applied in the given order. Only fields the resource reports as sortable are accepted.',
            items: [
                'type' => 'object',
                'properties' => [
                    'field' => ['type' => 'string'],
                    'dir' => ['type' => 'string', 'enum' => ['asc', 'desc']],
                ],
                'required' => ['field'],
            ],
        )]
        array $sort = [],
        int $page = 1,
        int $pageSize = 20,
    ): array {
        return $this->dispatch(messageFactory: fn () => new QueryModelQuery(
            alias: $alias,
            filters: $filters,
            include: $include,
            sort: $sort,
            page: $page,
            pageSize: $pageSize,
            role: RequestExtractor::getUserRole(request: $this->request()),
        ));
    }
}
